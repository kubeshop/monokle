import {monaco} from 'react-monaco-editor';

import fs from 'fs';
import path from 'path';
import {LineCounter} from 'yaml';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {FileMapType, HelmChartMapType, HelmValuesMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {FileEntry} from '@models/fileentry';
import {K8sResource, RefPosition, ResourceRef, ResourceRefType} from '@models/k8sresource';
import {MonacoSelectionFile, MonacoUiState} from '@models/ui';

import {getResourceFolder} from '@redux/services/fileEntry';
import {NodeWrapper, isPreviewResource, isUnsavedResource} from '@redux/services/resource';
import {isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {getHelmValueRanges, getObjectKeys} from '@molecules/Monaco/helmCodeIntel';
import {processSymbols} from '@molecules/Monaco/symbolProcessing';

import {isDefined} from '@utils/filter';
import {parseAllYamlDocuments} from '@utils/yaml';

import {getIncomingRefMappers, getRegisteredKindHandlers} from '@src/kindhandlers';

import {GlyphDecorationTypes, InlineDecorationTypes} from './editorConstants';
import {
  createCommandMarkdownLink,
  createCompletionProvider,
  createGlyphDecoration,
  createHoverProvider,
  createInlineDecoration,
  createLinkProvider,
  createMarkdownString,
  createMarker,
  getSymbolsBeforePosition,
} from './editorHelpers';

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

function areRefPosEqual(a: RefPosition, b: RefPosition) {
  return a.line === b.line && a.column === b.column && a.length === b.length;
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

  const policyIntel = applyPolicyIntel(resource);
  decorations.push(...policyIntel.decorations);
  markers.push(...policyIntel.markers);

  return {
    newDecorations: decorations,
    newDisposables: disposables,
    newMarkers: markers,
  };
}

function applyRefIntel(
  resource: K8sResource,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void,
  createResource: ((outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void) | undefined,
  resourceMap: ResourceMapType,
  fileMap: FileMapType
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
  disposables: monaco.IDisposable[];
} {
  const refs = resource.refs ?? [];
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const newDisposables: monaco.IDisposable[] = [];

  if (refs.length === 0) {
    return {decorations: newDecorations, disposables: newDisposables};
  }

  const listOfMatchedRefsByEqualPos: {refType: ResourceRefType; position: RefPosition; matchedRefs: ResourceRef[]}[] =
    [];

  // find refs that can be decorated
  refs.forEach(ref => {
    const refPos = ref.position;

    if (refPos) {
      const refsByEqualPosIndex = listOfMatchedRefsByEqualPos.findIndex(e => areRefPosEqual(e.position, refPos));
      if (refsByEqualPosIndex === -1) {
        listOfMatchedRefsByEqualPos.push({
          refType: ref.type,
          position: refPos,
          matchedRefs: [ref],
        });
      } else {
        listOfMatchedRefsByEqualPos[refsByEqualPosIndex].matchedRefs.push(ref);
      }
    }
  });

  // decorate matched refs
  listOfMatchedRefsByEqualPos.forEach(({matchedRefs, position, refType}) => {
    const inlineRange = new monaco.Range(
      position.line,
      position.column,
      position.line,
      position.column + position.length
    );

    const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
    matchedRefs.forEach(matchRef => {
      if (!matchRef.target) {
        return;
      }

      // add command for creating resource from unsatisfied ref
      if (createResource && isUnsatisfiedRef(matchRef.type)) {
        if (matchRef.target.type === 'resource' && !matchRef.target.resourceId && matchRef.target.resourceKind) {
          const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
            `Create ${matchRef.target.resourceKind}`,
            'Create Resource',
            () => {
              createResource(matchRef, resource.namespace, getResourceFolder(resource));
            }
          );
          commandMarkdownLinkList.push(commandMarkdownLink);
          newDisposables.push(commandDisposable);
        }
      }
      // add command for navigating to resource
      else if (matchRef.target.type === 'resource' && matchRef.target.resourceId) {
        const outgoingRefResource = resourceMap[matchRef.target.resourceId];
        if (!outgoingRefResource) {
          return;
        }

        let text = `${outgoingRefResource.kind}: ${outgoingRefResource.name}`;
        if (!isPreviewResource(outgoingRefResource) && !isUnsavedResource(outgoingRefResource)) {
          text += ` in ${outgoingRefResource.filePath}`;
        }

        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(text, 'Select resource', () => {
          // @ts-ignore
          selectResource(matchRef.target?.resourceId);
        });
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      }
      // add command for navigating to file
      else if (matchRef.target.type === 'file') {
        const outgoingRefFile = fileMap[matchRef.target.filePath];
        if (!outgoingRefFile) {
          return;
        }
        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
          `${outgoingRefFile.name}`,
          'Select file',
          () => {
            // @ts-ignore
            selectFilePath(matchRef.target?.filePath);
          }
        );
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      }
    });

    const hoverTitle =
      refType === ResourceRefType.Outgoing
        ? 'Outgoing Links'
        : refType === ResourceRefType.Incoming
        ? 'Incoming Links'
        : 'Unsatisfied link';

    const hoverCommandMarkdownLinkList = [createMarkdownString(hoverTitle), ...commandMarkdownLinkList];

    // aggregate commands into markdown
    if (hoverCommandMarkdownLinkList.length > 1) {
      const hoverDisposable = createHoverProvider(inlineRange, hoverCommandMarkdownLinkList);
      newDisposables.push(hoverDisposable);
    }

    // unsatisfied refs take precedence for decorations
    const hasUnsatisfiedRef = matchedRefs.some(ref => isUnsatisfiedRef(ref.type));

    const inlineDecoration = createInlineDecoration(
      inlineRange,
      hasUnsatisfiedRef ? InlineDecorationTypes.UnsatisfiedRef : InlineDecorationTypes.SatisfiedRef
    );
    newDecorations.push(inlineDecoration);

    const glyphDecoration = createGlyphDecoration(
      position.line,
      hasUnsatisfiedRef
        ? GlyphDecorationTypes.UnsatisfiedRef
        : refType === ResourceRefType.Outgoing
        ? GlyphDecorationTypes.OutgoingRef
        : GlyphDecorationTypes.IncomingRef,
      hoverCommandMarkdownLinkList
    );
    newDecorations.push(glyphDecoration);

    // create default link if there is only one command
    if (matchedRefs.length === 1) {
      const matchRef = matchedRefs[0];
      if (createResource || !isUnsatisfiedRef(matchRef.type)) {
        const linkDisposable = createLinkProvider(
          inlineRange,
          isUnsatisfiedRef(matchRef.type) ? 'Create resource' : 'Open resource',
          () => {
            if (isUnsatisfiedRef(matchRef.type) && createResource) {
              createResource(matchRef, resource.namespace, getResourceFolder(resource));
            } else if (matchRef.target?.type === 'resource' && matchRef.target.resourceId) {
              selectResource(matchRef.target.resourceId);
            } else if (matchRef.target?.type === 'file' && matchRef.target.filePath) {
              selectFilePath(matchRef.target.filePath);
            }
          }
        );
        newDisposables.push(linkDisposable);
      }
    }
  });

  return {decorations: newDecorations, disposables: newDisposables};
}

function applyPolicyIntel(resource: K8sResource): {
  decorations: monaco.editor.IModelDeltaDecoration[];
  markers: monaco.editor.IMarkerData[];
} {
  const issues = resource.issues?.errors ?? [];

  const glyphs = issues.map(issue => {
    const rule = issue.rule!;
    const message = [createMarkdownString(`${rule.shortDescription.text} __(${issue.message})__`)].filter(isDefined);

    return createGlyphDecoration(issue.errorPos?.line ?? 1, GlyphDecorationTypes.PolicyIssue, message);
  });

  const markers = issues
    .map(issue => {
      if (
        !issue.rule ||
        !issue.errorPos ||
        issue.errorPos.line === 1 ||
        issue.errorPos.endLine === undefined ||
        issue.errorPos.endColumn === undefined
      ) {
        return undefined;
      }

      const range = new monaco.Range(
        issue.errorPos.line,
        issue.errorPos.column,
        issue.errorPos.endLine,
        issue.errorPos.endColumn
      );

      const message = `${issue.rule.shortDescription.text}\n  ${issue.rule.longDescription.text}\n    ${issue.rule.help.text}`;

      return createMarker(issue.rule.id, message, range);
    })
    .filter(isDefined);

  return {decorations: glyphs, markers};
}

interface ApplyHelmFileArgs {
  code: string;
  currentFile: FileEntry;
  helmChartMap?: HelmChartMapType;
  helmValuesMap?: HelmValuesMapType;
  selectFilePath: (filePath: string) => void;
  fileMap: FileMapType;
  setEditorSelection: (selection: Partial<MonacoUiState>) => void;
}

interface HelmValueMatch {
  path: string;
  keyPath: string;
  value: any;
  linePosition: RefPosition;
}

const get = (t: object, objPath: string) => objPath.split('.').reduce((r, k) => (r as any)?.[k], t);

const getRange = (contents: any, keyPath: string): any => {
  const keyParts = keyPath.split('.');
  const keyStart = keyParts.shift();
  const pair = contents.items.find((item: any) => {
    return item.key.value === keyStart;
  });
  if (!pair) {
    return;
  }

  if (!keyParts.length) {
    return pair.value;
  }

  return getRange(pair.value, keyParts.join('.'));
};

interface GoToValuesFileParams {
  helmMatch: HelmValueMatch;
  selectFilePath: (filePath: string) => void;
  setEditorSelection: (selection: Partial<MonacoUiState>) => void;
}

const goToValuesFile = ({helmMatch, selectFilePath, setEditorSelection}: GoToValuesFileParams) => {
  selectFilePath(helmMatch.path);

  const selection: MonacoSelectionFile = {
    type: 'file',
    filePath: helmMatch.path,
    range: {
      startLineNumber: helmMatch.linePosition.line,
      endLineNumber: helmMatch.linePosition.line,
      startColumn: helmMatch.linePosition.column,
      endColumn: helmMatch.linePosition.column + helmMatch.linePosition.length,
    },
  };
  setEditorSelection({selection});
};

const applyForHelmFile = ({
  code,
  currentFile,
  helmChartMap,
  helmValuesMap,
  selectFilePath,
  fileMap,
  setEditorSelection,
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
    const lineCounter = new LineCounter();
    const documents = parseAllYamlDocuments(valueFileContent, lineCounter);
    documents.forEach((doc: any) => {
      const helmObject = doc.toJS();
      const fileKeyPaths = getObjectKeys(helmObject).map(keyPath => {
        const nodeWrapper = new NodeWrapper(getRange(doc.contents, keyPath), lineCounter);
        return {
          value: get(helmObject, keyPath),
          path: valueFilePath,
          keyPath: `.Values.${keyPath}`,
          linePosition: nodeWrapper.getNodePosition(),
        };
      });

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
          `${keyPathInFile.path}`,
          'Select file',
          () => {
            goToValuesFile({
              selectFilePath,
              helmMatch: keyPathInFile,
              setEditorSelection,
            });
          },
          `Value: ${keyPathInFile.value}\n\nGo to `
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
          goToValuesFile({
            selectFilePath,
            helmMatch: keyPathsInFile[0],
            setEditorSelection,
          });
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
