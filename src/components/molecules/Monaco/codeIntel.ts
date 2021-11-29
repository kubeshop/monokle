import {monaco} from 'react-monaco-editor';

import {FileMapType, ResourceFilterType, ResourceMapType} from '@models/appstate';
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
  getSymbols,
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

function getSymbolValue(lines: string[], symbol: monaco.languages.DocumentSymbol, includeName?: boolean) {
  const line = lines[symbol.range.startLineNumber - 1];
  if (line) {
    const str = line.substr(symbol.range.startColumn - 1, symbol.range.endColumn - symbol.range.startColumn);

    if (includeName) {
      return str;
    }

    const ix = str.indexOf(':', symbol.name.length);
    return str.substring(ix + 1).trim();
  }
}

function addNamespaceFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[]
) {
  const namespace = getSymbolValue(lines, symbol);
  if (namespace) {
    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
      `Filter on namespace [${namespace}]`,
      () => {
        filterResources({namespace, labels: {}, annotations: {}});
      }
    );
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);
  }
}

function addKindFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[]
) {
  const kind = getSymbolValue(lines, symbol);
  if (kind) {
    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(`Filter on kind [${kind}]`, () => {
      filterResources({kind, labels: {}, annotations: {}});
    });
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);
  }
}

function addLabelFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[]
) {
  const label = getSymbolValue(lines, symbol, true);
  if (label) {
    const value = label.substring(symbol.name.length + 1).trim();

    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(`Filter on label [${label}]`, () => {
      const labels: Record<string, string | null> = {};
      labels[symbol.name] = value;
      filterResources({labels, annotations: {}});
    });
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);
  }
}

function addAnnotationFilterLink(
  lines: string[],
  symbol: monaco.languages.DocumentSymbol,
  filterResources: (filter: ResourceFilterType) => void,
  newDisposables: monaco.IDisposable[]
) {
  const annotation = getSymbolValue(lines, symbol, true);
  if (annotation) {
    const value = annotation.substring(symbol.name.length + 1).trim();

    const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
      `Filter on annotation [${annotation}]`,
      () => {
        const annotations: Record<string, string | null> = {};
        annotations[symbol.name] = value;
        filterResources({labels: {}, annotations});
      }
    );
    newDisposables.push(commandDisposable);

    const hoverDisposable = createHoverProvider(symbol.range, [
      createMarkdownString('Filter Resources'),
      commandMarkdownLink,
    ]);
    newDisposables.push(hoverDisposable);
  }
}

function processSymbol(
  symbol: monaco.languages.DocumentSymbol,
  parents: monaco.languages.DocumentSymbol[],
  lines: string[],
  filterResources: (filter: ResourceFilterType) => void
) {
  const newDisposables: monaco.IDisposable[] = [];

  if (symbol.children) {
    symbol.children.forEach(child => {
      newDisposables.push(...processSymbol(child, parents.concat(symbol), lines, filterResources));
    });
  }

  if (symbol.name === 'namespace') {
    addNamespaceFilterLink(lines, symbol, filterResources, newDisposables);
  }

  if (symbol.name === 'kind') {
    addKindFilterLink(lines, symbol, filterResources, newDisposables);
  }

  if (parents.length > 0) {
    const parentName = parents[parents.length - 1].name;

    if (parentName === 'labels' || parentName === 'matchLabels') {
      addLabelFilterLink(lines, symbol, filterResources, newDisposables);
    } else if (parentName === 'annotations') {
      addAnnotationFilterLink(lines, symbol, filterResources, newDisposables);
    }
  }

  return newDisposables;
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
    const symbols: monaco.languages.DocumentSymbol[] = await getSymbols(model);
    const lines = resource.text.split('\n');

    newDisposables.push(...symbols.map(symbol => processSymbol(symbol, [], lines, filterResources)).flat());
  }

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
      if (createResource && isUnsatisfiedRef(outgoingRef.type)) {
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
      if (createResource || !isUnsatisfiedRef(outgoingRef.type)) {
        const linkDisposable = createLinkProvider(
          inlineRange,
          isUnsatisfiedRef(outgoingRef.type) ? 'Create resource' : 'Open resource',
          () => {
            if (isUnsatisfiedRef(outgoingRef.type) && createResource) {
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
    }
  });

  return {newDecorations, newDisposables};
}

export default {
  applyForResource,
  applyAutocomplete,
};
