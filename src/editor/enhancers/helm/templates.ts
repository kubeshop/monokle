import {flatten} from 'lodash';
import * as monaco from 'monaco-editor';

import {selectedFilePathSelector} from '@redux/selectors';

import {InlineDecorationTypes} from '@editor/editor.constants';
import {addEditorCommand, addEditorDecorations, addEditorHover, addEditorLink} from '@editor/editor.instance';
import {EditorCommand} from '@editor/editor.types';
import {createInlineDecoration, createMarkdownString} from '@editor/editor.utils';

import {createEditorEnhancer} from '../createEnhancer';
import {goToFileAndHighlightCode} from './utils';

export const helmTemplateFileEnhancer = createEditorEnhancer(({state, resourceIdentifier, dispatch}) => {
  if (resourceIdentifier) {
    return;
  }

  const helmChartMap = state.main.helmChartMap;
  const helmValuesMap = state.main.helmValuesMap;
  const helmTemplatesMap = state.main.helmTemplatesMap;
  const selectedFilePath = selectedFilePathSelector(state);
  const helmTemplate = Object.values(helmTemplatesMap).find(t => t.filePath === selectedFilePath);

  if (!helmTemplate) {
    return;
  }

  const helmChart = helmChartMap[helmTemplate.helmChartId];

  if (!helmChart) {
    return;
  }

  const helmValues = flatten(
    helmChart.valueFileIds.map(valueFileId => {
      return helmValuesMap[valueFileId].values.map(v => ({
        ...v,
        filePath: helmValuesMap[valueFileId].filePath,
      }));
    })
  );
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

  helmTemplate.values.forEach(helmFileValue => {
    const keyPathsInFile = helmValues.filter(helmValue => helmValue.keyPath === helmFileValue.value);

    const canFindKeyInValuesFile = Boolean(keyPathsInFile.length);
    newDecorations.push(
      createInlineDecoration(
        helmFileValue.range,
        canFindKeyInValuesFile ? InlineDecorationTypes.SatisfiedRef : InlineDecorationTypes.UnsatisfiedRef
      )
    );

    if (canFindKeyInValuesFile) {
      const commands: EditorCommand[] = [];
      keyPathsInFile.forEach(keyPathInFile => {
        const value =
          typeof keyPathInFile.value === 'object' ? JSON.stringify(keyPathInFile.value, null, 4) : keyPathInFile.value;

        const newCommand = addEditorCommand({
          type: 'go_to_helm_values_file',
          text: `${keyPathInFile.filePath}`,
          altText: 'Select file',
          handler: () => {
            goToFileAndHighlightCode({
              state,
              range: {
                startLineNumber: keyPathInFile.linePosition.line,
                endLineNumber: keyPathInFile.linePosition.line,
                startColumn: keyPathInFile.linePosition.column,
                endColumn: keyPathInFile.linePosition.column + keyPathInFile.linePosition.length,
              },
              filePath: keyPathInFile.filePath,
              dispatch,
              isHelmValuesFile: true,
            });
          },
          beforeText: `Value: ${value}\n\nFound in: `,
          afterText: ` at Ln ${keyPathInFile.linePosition.line}`,
        });

        commands.push(newCommand);
      });

      const hasMultipleLinks = keyPathsInFile.length > 1;
      const text = hasMultipleLinks ? `Found this value in ${keyPathsInFile.length} helm value files` : ``;
      if (!hasMultipleLinks) {
        addEditorLink({
          range: helmFileValue.range,
          tooltip: 'Open file',
          handler: () => {
            goToFileAndHighlightCode({
              state,
              range: {
                startLineNumber: keyPathsInFile[0].linePosition.line,
                endLineNumber: keyPathsInFile[0].linePosition.line,
                startColumn: keyPathsInFile[0].linePosition.column,
                endColumn: keyPathsInFile[0].linePosition.column + keyPathsInFile[0].linePosition.length,
              },
              filePath: keyPathsInFile[0].filePath,
              dispatch,
              isHelmValuesFile: true,
            });
          },
        });
      }

      if (commands.length) {
        addEditorHover({
          range: helmFileValue.range,
          contents: [createMarkdownString(text), ...commands.map(c => c.markdownLink)],
        });
      }

      return;
    }

    addEditorHover({
      range: helmFileValue.range,
      contents: [createMarkdownString('This value was not found in any helm values file.')],
    });
  });

  addEditorDecorations(newDecorations);
});
