// import {monaco} from 'react-monaco-editor';
// import {createCompletionProvider, getSymbolsBeforePosition} from '@molecules/Monaco/editorHelpers';
// import {getIncomingRefMappers, getRegisteredKindHandlers} from '@src/kindhandlers';
import {HelmValuesMapType} from '@shared/models/appState';
import {FileEntry} from '@shared/models/fileEntry';
// import {K8sResource, ResourceMap, ResourceMetaMap} from '@shared/models/k8sResource';
import {MonacoRange, MonacoSelectionFile, MonacoUiState} from '@shared/models/ui';

export function getHelmValueFile(currentFile?: FileEntry, helmValuesMap?: HelmValuesMapType) {
  const helmChartId = currentFile?.helmChartId;
  const filePath = currentFile?.filePath;
  if (!helmChartId || !filePath) {
    return;
  }

  return Object.values(helmValuesMap || {}).find(valueFile => valueFile.filePath === filePath);
}

interface GoToValuesFileParams {
  range: MonacoRange;
  filePath: string;
  selectFilePath: (filePath: string) => void;
  setEditorSelection: (selection: Partial<MonacoUiState>) => void;
}

export const goToFileAndHighlightCode = ({
  range,
  filePath,
  selectFilePath,
  setEditorSelection,
}: GoToValuesFileParams) => {
  selectFilePath(filePath);

  const selection: MonacoSelectionFile = {
    type: 'file',
    filePath,
    range,
  };
  setEditorSelection({selection});
};

// const getSymbolsToResourceKindMatchers = () =>
//   getRegisteredKindHandlers()
//     .map(resourceKindHandler => {
//       return {
//         resourceKind: resourceKindHandler.kind,
//         symbolsPaths: getIncomingRefMappers(resourceKindHandler.kind)
//           .map(incomingRefMapper => incomingRefMapper.source.pathParts)
//           .reduce<string[][]>((previousValue, currentValue) => {
//             if (
//               previousValue.some(
//                 symbolsPath =>
//                   symbolsPath.length === currentValue.length &&
//                   symbolsPath.every((symbol, index) => symbol === currentValue[index])
//               )
//             ) {
//               return previousValue;
//             }
//             return [...previousValue, currentValue];
//           }, []),
//       };
//     })
//     .flat();

// const getResourceKindFromSymbols = (symbols: monaco.languages.DocumentSymbol[]) => {
//   const symbolsToResourceKindMatchers = getSymbolsToResourceKindMatchers();
//   for (let i = 0; i < symbolsToResourceKindMatchers.length; i += 1) {
//     const matcher = symbolsToResourceKindMatchers[i];
//     if (matcher.symbolsPaths && matcher.symbolsPaths.length > 0) {
//       const isMatch = matcher.symbolsPaths.some(symbolsPath => {
//         const sliceIndex = matcher.symbolsPaths ? -symbolsPath.length : 0;
//         const slicedSymbols = symbols.slice(sliceIndex);
//         if (symbolsPath.length === slicedSymbols.length) {
//           let areEqual = true;
//           symbolsPath.forEach((symbol, index) => {
//             if (symbol !== slicedSymbols[index].name) {
//               areEqual = false;
//             }
//           });
//           return areEqual;
//         }
//         return false;
//       });
//       if (isMatch) {
//         return matcher.resourceKind;
//       }
//     }
//   }
//   return null;
// };

// function createSuggestionsForResourceKind(
//   resourceMap: ResourceMetaMap,
//   resourceKind: string,
//   range: monaco.IRange,
//   triggerCharacter: string | undefined
// ) {
//   const suggestions: monaco.languages.CompletionItem[] = [];
//   Object.values(resourceMap).forEach(resource => {
//     if (resource.kind === resourceKind) {
//       suggestions.push({
//         label: resource.name,
//         kind: monaco.languages.CompletionItemKind.Reference,
//         insertText: triggerCharacter === ' ' ? resource.name : ` ${resource.name}`,
//         range,
//       });
//     }
//   });
//   return suggestions;
// }

// TODO: re-implement logic for auto-complete after @monokle/validation
// export function applyAutocomplete(resourceMap: ResourceMap) {
//   const newCompletionDisposable = createCompletionProvider({
//     triggerCharacters: [':', '-', ' '],
//     provideCompletionItems: async (model, position, context) => {
//       const symbols = await getSymbolsBeforePosition(model, position);
//       const resourceKind = getResourceKindFromSymbols(symbols);
//       if (resourceKind) {
//         return {
//           suggestions: createSuggestionsForResourceKind(
//             resourceMap,
//             resourceKind,
//             new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
//             context.triggerCharacter
//           ),
//         };
//       }
//       return null;
//     },
//   });
//   return newCompletionDisposable;
// }
