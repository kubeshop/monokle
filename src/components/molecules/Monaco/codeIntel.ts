import {monaco} from 'react-monaco-editor';

import {FileMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRef, ResourceRefType} from '@models/k8sresource';

import {getResourceFolder} from '@redux/services/fileEntry';
import {isPreviewResource, isUnsavedResource} from '@redux/services/resource';
import {isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {processSymbols} from '@molecules/Monaco/symbolProcessing';

import {isDefined} from '@utils/filter';

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
) {
  const refs = resource.refs;
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const newDisposables: monaco.IDisposable[] = [];

  if (model) {
    await processSymbols(model, resource, filterResources, newDisposables, newDecorations);
  }

  if (!refs || refs.length === 0) {
    return {newDecorations, newDisposables};
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

  const policyGlyphs = decoratePolicyIssues(resource);
  newDecorations.push(...policyGlyphs);

  return {newDecorations, newDisposables};
}

function decoratePolicyIssues(resource: K8sResource): monaco.editor.IModelDeltaDecoration[] {
  const issues = resource.issues?.errors ?? [];
  const glyphs = issues.map(issue => {
    const rule = issue.rule!;
    const message = [
      createMarkdownString(`__${issue.message}:__ ${rule.longDescription.text} ${rule.help.text}`),
    ].filter(isDefined);

    return createGlyphDecoration(issue.errorPos?.line ?? 1, GlyphDecorationTypes.PolicyIssue, message);
  });
  return glyphs;
}

export default {
  applyForResource,
  applyAutocomplete,
};
