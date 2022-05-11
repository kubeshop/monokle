import {monaco} from 'react-monaco-editor';

import fs from 'fs';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {K8sResource, ResourceRef} from '@models/k8sresource';

import {getHelmValueRanges, getObjectKeys} from '@molecules/Monaco/helmCodeIntel';
import {processSymbols} from '@molecules/Monaco/symbolProcessing';

import {parseAllYamlDocuments} from '@utils/yaml';

import {getIncomingRefMappers, getRegisteredKindHandlers} from '@src/kindhandlers';

import {InlineDecorationTypes} from '../editorConstants';
import {
  createCommandMarkdownLink,
  createCompletionProvider,
  createHoverProvider,
  createInlineDecoration,
  createLinkProvider,
  createMarkdownString,
  getSymbolsBeforePosition,
} from '../editorHelpers';
import applyErrorIntel from './applyErrorIntel';
import applyPolicyIntel from './applyPolicyIntel';
import applyRefIntel from './applyRefIntel';

export type SymbolsToResourceKindMatcher = {
  resourceKind: string;
  symbolsPaths?: string[][];
};

const getSymbolsToResourceKindMatchers = () =>
  getRegisteredKindHandlers()
    .map(resourceKindHandler => {
      return {
        resourceKind: resourceKindHandler.kind,
        symbolsPaths: getIncomingRefMappers(resourceKindHandler.kind)
          .map(incomingRefMapper => incomingRefMapper.source.pathParts)
          .reduce<string[][]>((previousValue, currentValue) => {
            if (
              previousValue.some(
                symbolsPath =>
                  symbolsPath.length === currentValue.length &&
                  symbolsPath.every((symbol, index) => symbol === currentValue[index])
              )
            ) {
              return previousValue;
            }
            return [...previousValue, currentValue];
          }, []),
      };
    })
    .flat();

const getResourceKindFromSymbols = (symbols: monaco.languages.DocumentSymbol[]) => {
  const symbolsToResourceKindMatchers = getSymbolsToResourceKindMatchers();
  for (let i = 0; i < symbolsToResourceKindMatchers.length; i += 1) {
    const matcher = symbolsToResourceKindMatchers[i];
    if (matcher.symbolsPaths && matcher.symbolsPaths.length > 0) {
      const isMatch = matcher.symbolsPaths.some(symbolsPath => {
        const sliceIndex = matcher.symbolsPaths ? -symbolsPath.length : 0;
        const slicedSymbols = symbols.slice(sliceIndex);
        if (symbolsPath.length === slicedSymbols.length) {
          let areEqual = true;
          symbolsPath.forEach((symbol, index) => {
            if (symbol !== slicedSymbols[index].name) {
              areEqual = false;
            }
          });
          return areEqual;
        }
        return false;
      });
      if (isMatch) {
        return matcher.resourceKind;
      }
    }
  }
  return null;
};

function createSuggestionsForResourceKind(
  resourceMap: ResourceMapType,
  resourceKind: string,
  range: monaco.IRange,
  triggerCharacter: string | undefined
) {
  const suggestions: monaco.languages.CompletionItem[] = [];
  Object.values(resourceMap).forEach((resource: K8sResource) => {
    if (resource.kind === resourceKind) {
      suggestions.push({
        label: resource.name,
        kind: monaco.languages.CompletionItemKind.Reference,
        insertText: triggerCharacter === ' ' ? resource.name : ` ${resource.name}`,
        range,
      });
    }
  });
  return suggestions;
}

export function applyAutocomplete(resourceMap: ResourceMapType) {
  const newCompletionDisposable = createCompletionProvider({
    triggerCharacters: [':', '-', ' '],
    provideCompletionItems: async (model, position, context) => {
      const symbols = await getSymbolsBeforePosition(model, position);
      const resourceKind = getResourceKindFromSymbols(symbols);
      if (resourceKind) {
        return {
          suggestions: createSuggestionsForResourceKind(
            resourceMap,
            resourceKind,
            new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            context.triggerCharacter
          ),
        };
      }
      return null;
    },
  });
  return newCompletionDisposable;
}

export async function applyForResource(
  resource: K8sResource,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void,
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void) | undefined,
  filterResources: (filter: ResourceFilterType) => void,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  model: monaco.editor.IModel | null
): Promise<{
  newDecorations: monaco.editor.IModelDeltaDecoration[];
  newDisposables: monaco.IDisposable[];
  newMarkers: monaco.editor.IMarkerData[];
}> {
  const disposables: monaco.IDisposable[] = [];
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];
  const markers: monaco.editor.IMarkerData[] = [];

  if (model) {
    await processSymbols(model, resource, filterResources, disposables, decorations);
  }

  const refIntel = applyRefIntel(resource, selectResource, selectFilePath, createResource, resourceMap, fileMap);
  disposables.push(...refIntel.disposables);
  decorations.push(...refIntel.decorations);

  const errorIntel = applyErrorIntel(resource);
  decorations.push(...errorIntel.decorations);

  const policyIntel = applyPolicyIntel(resource);
  decorations.push(...policyIntel.decorations);
  markers.push(...policyIntel.markers);

  return {
    newDecorations: decorations,
    newDisposables: disposables,
    newMarkers: markers,
  };
}

interface ApplyHelmFileArgs {
  code: string;
  currentFile: FileEntry;
  helmChartMap?: HelmChartMapType;
  helmValuesMap?: HelmValuesMapType;
  selectFilePath: (filePath: string) => void;
  fileMap: FileMapType;
}

interface HelmValueMatch {
  path: string;
  keyPath: string;
}

const applyForHelmFile = ({
  code,
  currentFile,
  helmChartMap,
  helmValuesMap,
  selectFilePath,
  fileMap,
}: ApplyHelmFileArgs) => {
  const helmNewDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const helmNewDisposables: monaco.IDisposable[] = [];
  const helmValueRanges = getHelmValueRanges(code);

  if (!helmValueRanges.length || !helmValuesMap || !helmChartMap || !currentFile) {
    return {helmNewDisposables, helmNewDecorations};
  }

  const validKeyPaths: HelmValueMatch[] = [];
  const fileHelmChart = helmChartMap[currentFile.helmChartId as string];
  const valueFilePaths = fileHelmChart.valueFileIds.map(valueFileId => helmValuesMap[valueFileId].filePath);

  valueFilePaths.forEach(valueFilePath => {
    const valueFileContent = fs.readFileSync(path.join(fileMap[ROOT_FILE_ENTRY].filePath, valueFilePath), 'utf8');
    const documents = parseAllYamlDocuments(valueFileContent);
    documents.forEach(doc => {
      const fileKeyPaths = getObjectKeys(doc.toJS(), '.Values.').map(keyPath => ({
        path: valueFilePath,
        keyPath,
      }));

      validKeyPaths.push(...fileKeyPaths);
    });
  });

  helmValueRanges.forEach(helmValueRange => {
    const keyPathsInFile = validKeyPaths.filter(validKeyPath => helmValueRange.value === validKeyPath.keyPath);
    const canFindKeyInValuesFile = Boolean(keyPathsInFile.length);
    helmNewDecorations.push(
      createInlineDecoration(
        helmValueRange.range,
        canFindKeyInValuesFile ? InlineDecorationTypes.SatisfiedRef : InlineDecorationTypes.UnsatisfiedRef
      )
    );

    if (canFindKeyInValuesFile) {
      const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
      keyPathsInFile.forEach(keyPathInFile => {
        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
          `Go to: ${keyPathInFile.path}`,
          'Select file',
          () => {
            // @ts-ignore
            selectFilePath(keyPathInFile.path);
          }
        );
        commandMarkdownLinkList.push(commandMarkdownLink);
        helmNewDisposables.push(commandDisposable);
      });

      const hasMultipleLinks = keyPathsInFile.length > 1;
      const text = hasMultipleLinks
        ? `Found this value in ${keyPathsInFile.length} helm value files`
        : `Found this value in ${keyPathsInFile[0].path}`;
      if (!hasMultipleLinks) {
        const linkDisposable = createLinkProvider(helmValueRange.range, 'Open file', () => {
          selectFilePath(keyPathsInFile[0].path);
        });
        helmNewDisposables.push(linkDisposable);
      }

      const hoverCommandMarkdownLinkList = [createMarkdownString(text), ...commandMarkdownLinkList];
      if (commandMarkdownLinkList.length) {
        const hoverDisposable = createHoverProvider(helmValueRange.range, hoverCommandMarkdownLinkList);
        helmNewDisposables.push(hoverDisposable);
      }

      return;
    }

    const linkDisposable = createLinkProvider(
      helmValueRange.range,
      'We cannot find the value in the helm values file',
      () => {}
    );
    helmNewDisposables.push(linkDisposable);
  });

  return {helmNewDisposables, helmNewDecorations};
};

export default {
  applyForResource,
  applyForHelmFile,
  applyAutocomplete,
};
