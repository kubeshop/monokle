import {monaco} from 'react-monaco-editor';

import {flatten} from 'lodash';

import {HelmValueMatch} from '@models/helm';
import {MonacoUiState} from '@models/ui';

import {getHelmValueRanges} from '@redux/services/helm';

import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';
import {goToFileAndHighlightCode} from '@molecules/Monaco/CodeIntel/util';
import {InlineDecorationTypes} from '@molecules/Monaco/editorConstants';
import {
  createCommandMarkdownLink,
  createHoverProvider,
  createInlineDecoration,
  createLinkProvider,
  createMarkdownString,
} from '@molecules/Monaco/editorHelpers';

interface GoToValuesFileParams {
  helmMatch: HelmValueMatch & {filePath: string};
  selectFilePath: (filePath: string) => void;
  setEditorSelection: (selection: Partial<MonacoUiState>) => void;
}

const goToValuesFile = ({helmMatch, selectFilePath, setEditorSelection}: GoToValuesFileParams) => {
  return goToFileAndHighlightCode({
    range: {
      startLineNumber: helmMatch.linePosition.line,
      endLineNumber: helmMatch.linePosition.line,
      startColumn: helmMatch.linePosition.column,
      endColumn: helmMatch.linePosition.column + helmMatch.linePosition.length,
    },
    filePath: helmMatch.filePath,
    setEditorSelection,
    selectFilePath,
  });
};

export const helmFileCodeIntel: CodeIntelApply = {
  name: 'helmFile',
  shouldApply: params => {
    return Boolean(params?.currentFile?.helmChartId);
  },
  codeIntel: async ({code, currentFile, helmChartMap, helmValuesMap, selectFilePath, setEditorSelection}) => {
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
    const newDisposables: monaco.IDisposable[] = [];
    const helmValueRanges = getHelmValueRanges(code);

    if (!helmValueRanges.length || !helmValuesMap || !helmChartMap || !currentFile || !currentFile.helmChartId) {
      return {newDisposables, newDecorations};
    }

    const helmFile = helmChartMap[currentFile.helmChartId].templateFilePaths.find(
      templateFile => templateFile.filePath === currentFile.filePath
    );
    if (!helmFile) {
      return {newDisposables, newDecorations};
    }

    const fileHelmChart = helmChartMap[currentFile.helmChartId as string];
    const helmValues = flatten(
      fileHelmChart.valueFileIds.map(valueFileId => {
        return helmValuesMap[valueFileId].values.map(v => ({...v, filePath: helmValuesMap[valueFileId].filePath}));
      })
    );
    helmFile.values.forEach(helmFileValue => {
      const keyPathsInFile = helmValues.filter(helmValue => helmValue.keyPath === helmFileValue.value);

      const canFindKeyInValuesFile = Boolean(keyPathsInFile.length);
      newDecorations.push(
        createInlineDecoration(
          helmFileValue.range,
          canFindKeyInValuesFile ? InlineDecorationTypes.SatisfiedRef : InlineDecorationTypes.UnsatisfiedRef
        )
      );

      if (canFindKeyInValuesFile) {
        const commandMarkdownLinkList: monaco.IMarkdownString[] = [];
        keyPathsInFile.forEach(keyPathInFile => {
          const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
            `${keyPathInFile.filePath}`,
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
          newDisposables.push(commandDisposable);
        });

        const hasMultipleLinks = keyPathsInFile.length > 1;
        const text = hasMultipleLinks
          ? `Found this value in ${keyPathsInFile.length} helm value files`
          : `Found this value in ${keyPathsInFile[0].filePath}`;
        if (!hasMultipleLinks) {
          const linkDisposable = createLinkProvider(helmFileValue.range, 'Open file', () => {
            goToValuesFile({
              selectFilePath,
              helmMatch: keyPathsInFile[0],
              setEditorSelection,
            });
          });
          newDisposables.push(linkDisposable);
        }

        const hoverCommandMarkdownLinkList = [createMarkdownString(text), ...commandMarkdownLinkList];
        if (commandMarkdownLinkList.length) {
          const hoverDisposable = createHoverProvider(helmFileValue.range, hoverCommandMarkdownLinkList);
          newDisposables.push(hoverDisposable);
        }

        return;
      }

      const linkDisposable = createLinkProvider(
        helmFileValue.range,
        'We cannot find the value in the helm values file',
        () => {}
      );
      newDisposables.push(linkDisposable);
    });

    return {newDisposables, newDecorations};
  },
};
