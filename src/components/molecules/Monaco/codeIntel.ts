import {monaco} from 'react-monaco-editor';
import {isUnsatisfiedRef, isOutgoingRef} from '@redux/services/resourceRefs';
import {K8sResource, ResourceRef, RefPosition} from '@models/k8sresource';

import {ResourceMapType} from '@models/appstate';

import {GlyphDecorationTypes, InlineDecorationTypes} from './editorConstants';

import {
  createCommandMarkdownLink,
  createCompletionProvider,
  createGlyphDecoration,
  createInlineDecoration,
  createHoverProvider,
  createMarkdownString,
  createLinkProvider,
  getSymbolsBeforePosition,
} from './editorHelpers';

type SymbolsToResourceKindMatcher = {
  resourceKind: string;
  symbolsPaths?: string[][];
  isMatch?(symbols: monaco.languages.DocumentSymbol[]): boolean;
};

const SymbolsToResourceKindMatchers: SymbolsToResourceKindMatcher[] = [
  {
    resourceKind: 'ConfigMap',
    symbolsPaths: [
      ['volumes', 'configMap', 'name'],
      ['configMap', 'name'],
      ['configMapRef', 'name'],
      ['configMapKeyRef', 'name'],
    ],
  },
  {
    resourceKind: 'Secret',
    symbolsPaths: [['imagePullSecrets'], ['secrets'], ['secretKeyRef', 'name'], ['volumes', 'secret', 'secretName']],
  },
  {
    resourceKind: 'ServiceAccount',
    symbolsPaths: [['serviceAccountName'], ['metadata', 'annotations', 'kubernetes.io/service-account.name']],
  },
  {
    resourceKind: 'ClusterRole',
    symbolsPaths: [['roleRef', 'name']],
  },
  {
    resourceKind: 'Service',
    symbolsPaths: [['backend', 'service', 'name']],
  },
  {
    resourceKind: 'PersistentVolumeClaim',
    symbolsPaths: [['spec', 'claimRef', 'name']],
  },
  {
    resourceKind: 'PersistentVolume',
    symbolsPaths: [['spec', 'volumeName']],
  },
  {
    resourceKind: 'ClusterRoleBinding',
    symbolsPaths: [['roleRef', 'name']],
  },
];

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
    if (matcher.isMatch) {
      if (matcher.isMatch(symbols)) {
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
  resourceMap: ResourceMapType
) {
  const refs = resource.refs;
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
  const newHoverDisposables: monaco.IDisposable[] = [];
  const newCommandDisposables: monaco.IDisposable[] = [];
  const newLinkDisposables: monaco.IDisposable[] = [];

  if (!refs || refs.length === 0) {
    return {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables};
  }

  const unsatisfiedRefs = refs?.filter(r => isUnsatisfiedRef(r.refType));
  const listOfOutgoingRefsByEqualPos: {position: RefPosition; outgoingRefs: ResourceRef[]}[] = [];

  refs.forEach(ref => {
    const refPos = ref.refPos;
    if (refPos && isOutgoingRef(ref.refType)) {
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

  unsatisfiedRefs.forEach(ref => {
    const refPos = ref.refPos;
    if (refPos) {
      const inlineRange = new monaco.Range(refPos.line, refPos.column, refPos.line, refPos.column + refPos.length);
      const glyphDecoration = createGlyphDecoration(refPos.line, GlyphDecorationTypes.UnsatisfiedRef);
      newDecorations.push(glyphDecoration);

      const inlineDecoration = createInlineDecoration(inlineRange, InlineDecorationTypes.UnsatisfiedRef);
      newDecorations.push(inlineDecoration);
    }
  });

  listOfOutgoingRefsByEqualPos.forEach(({outgoingRefs, position}) => {
    const inlineRange = new monaco.Range(
      position.line,
      position.column,
      position.line,
      position.column + position.length
    );

    const glyphDecoration = createGlyphDecoration(position.line, GlyphDecorationTypes.SatisfiedRef);
    newDecorations.push(glyphDecoration);

    const inlineDecoration = createInlineDecoration(inlineRange, InlineDecorationTypes.SatisfiedRef);
    newDecorations.push(inlineDecoration);

    const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
    outgoingRefs.forEach(outgoingRef => {
      if (!outgoingRef.targetResource) {
        return;
      }
      const outgoingRefResource = resourceMap[outgoingRef.targetResource];
      if (!outgoingRefResource) {
        return;
      }
      const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(outgoingRefResource.name, () => {
        if (outgoingRef.targetResource) {
          selectResource(outgoingRef.targetResource);
        }
      });
      commandMarkdownLinkList.push(commandMarkdownLink);
      newCommandDisposables.push(commandDisposable);
    });

    if (commandMarkdownLinkList.length > 0) {
      const hoverDisposable = createHoverProvider(inlineRange, [
        createMarkdownString('Outgoing Links'),
        ...commandMarkdownLinkList,
      ]);
      newHoverDisposables.push(hoverDisposable);
    }

    if (outgoingRefs.length === 1) {
      const outgoingRef = outgoingRefs[0];
      const linkDisposable = createLinkProvider(inlineRange, () => {
        if (outgoingRef.targetResource) {
          selectResource(outgoingRef.targetResource);
        }
      });
      newLinkDisposables.push(linkDisposable);
    }
  });

  return {newDecorations, newHoverDisposables, newCommandDisposables, newLinkDisposables};
}

export default {
  applyForResource,
  applyAutocomplete,
};
