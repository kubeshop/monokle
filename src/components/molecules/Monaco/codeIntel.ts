import {monaco} from 'react-monaco-editor';

import {FileMapType, ResourceMapType} from '@models/appstate';
import {K8sResource, RefPosition, ResourceRef} from '@models/k8sresource';

import {getResourceFolder} from '@redux/services/fileEntry';
import {isIncomingRef, isUnsatisfiedRef} from '@redux/services/resourceRefs';

import {ResourceKindHandlers, getIncomingRefMappers} from '@src/kindhandlers';

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

const SymbolsToResourceKindMatchers = ResourceKindHandlers.map(resourceKindHandler => {
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
}).flat();

const getResourceKindFromSymbols = (symbols: monaco.languages.DocumentSymbol[]) => {
  for (let i = 0; i < SymbolsToResourceKindMatchers.length; i += 1) {
    const matcher = SymbolsToResourceKindMatchers[i];
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

export function applyForResource(
  resource: K8sResource,
  selectResource: (resourceId: string) => void,
  selectFilePath: (filePath: string) => void,
  createResource: (outgoingRef: ResourceRef, namespace?: string, targetFolderget?: string) => void,
  resourceMap: ResourceMapType,
  fileMap: FileMapType
) {
  const refs = resource.refs;
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const newDisposables: monaco.IDisposable[] = [];

  if (!refs || refs.length === 0) {
    return {newDecorations, newDisposables};
  }

  const listOfOutgoingRefsByEqualPos: {position: RefPosition; outgoingRefs: ResourceRef[]}[] = [];

  // find refs that can be decorated
  refs.forEach(ref => {
    const refPos = ref.position;
    if (refPos && !isIncomingRef(ref.type)) {
      const refsByEqualPosIndex = listOfOutgoingRefsByEqualPos.findIndex(e => areRefPosEqual(e.position, refPos));
      if (refsByEqualPosIndex === -1) {
        listOfOutgoingRefsByEqualPos.push({
          position: refPos,
          outgoingRefs: [ref],
        });
      } else {
        listOfOutgoingRefsByEqualPos[refsByEqualPosIndex].outgoingRefs.push(ref);
      }
    }
  });

  // decorate matched refs
  listOfOutgoingRefsByEqualPos.forEach(({outgoingRefs, position}) => {
    const inlineRange = new monaco.Range(
      position.line,
      position.column,
      position.line,
      position.column + position.length
    );

    // unsatisfied refs take precedence for decorations
    const hasUnsatisfiedRef = outgoingRefs.some(ref => isUnsatisfiedRef(ref.type));
    const glyphDecoration = createGlyphDecoration(
      position.line,
      hasUnsatisfiedRef ? GlyphDecorationTypes.UnsatisfiedRef : GlyphDecorationTypes.SatisfiedRef
    );
    newDecorations.push(glyphDecoration);

    const inlineDecoration = createInlineDecoration(
      inlineRange,
      hasUnsatisfiedRef ? InlineDecorationTypes.UnsatisfiedRef : InlineDecorationTypes.SatisfiedRef
    );
    newDecorations.push(inlineDecoration);

    const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
    outgoingRefs.forEach(outgoingRef => {
      if (!outgoingRef.target) {
        return;
      }

      // add command for creating resource from unsatisfied ref
      if (isUnsatisfiedRef(outgoingRef.type)) {
        if (
          outgoingRef.target.type === 'resource' &&
          !outgoingRef.target.resourceId &&
          outgoingRef.target.resourceKind
        ) {
          const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
            `Create ${outgoingRef.target.resourceKind} Resource`,
            () => {
              // @ts-ignore
              createResource(outgoingRef, resource.namespace, getResourceFolder(resource));
            }
          );
          commandMarkdownLinkList.push(commandMarkdownLink);
          newDisposables.push(commandDisposable);
        }
      }
      // add command for navigating to resource
      else if (outgoingRef.target.type === 'resource' && outgoingRef.target.resourceId) {
        const outgoingRefResource = resourceMap[outgoingRef.target.resourceId];
        if (!outgoingRefResource) {
          return;
        }
        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
          `${outgoingRefResource.kind}: ${outgoingRefResource.name}`,
          () => {
            // @ts-ignore
            selectResource(outgoingRef.target?.resourceId);
          }
        );
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      }
      // add command for navigating to file
      else if (outgoingRef.target.type === 'file') {
        const outgoingRefFile = fileMap[outgoingRef.target.filePath];
        if (!outgoingRefFile) {
          return;
        }
        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
          `File: ${outgoingRefFile.name}`,
          () => {
            // @ts-ignore
            selectFilePath(outgoingRef.target?.filePath);
          }
        );
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      }
    });

    // aggregate commands into markdown
    if (commandMarkdownLinkList.length > 0) {
      const hoverDisposable = createHoverProvider(inlineRange, [
        createMarkdownString('Outgoing Links'),
        ...commandMarkdownLinkList,
      ]);
      newDisposables.push(hoverDisposable);
    }

    // create default link if there is only one command
    if (outgoingRefs.length === 1) {
      const outgoingRef = outgoingRefs[0];
      const linkDisposable = createLinkProvider(
        inlineRange,
        isUnsatisfiedRef(outgoingRef.type) ? 'Create resource' : 'Open resource',
        () => {
          if (isUnsatisfiedRef(outgoingRef.type)) {
            createResource(outgoingRef, resource.namespace, getResourceFolder(resource));
          } else if (outgoingRef.target?.type === 'resource' && outgoingRef.target.resourceId) {
            selectResource(outgoingRef.target.resourceId);
          } else if (outgoingRef.target?.type === 'file' && outgoingRef.target.filePath) {
            selectFilePath(outgoingRef.target.filePath);
          }
        }
      );
      newDisposables.push(linkDisposable);
    }
  });

  return {newDecorations, newDisposables};
}

export default {
  applyForResource,
  applyAutocomplete,
};
