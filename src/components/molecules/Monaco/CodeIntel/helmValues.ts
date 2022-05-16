import {monaco} from 'react-monaco-editor';

import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';
import {getHelmValueFile, goToFileAndHighlightCode} from '@molecules/Monaco/CodeIntel/util';
import {InlineDecorationTypes} from '@molecules/Monaco/editorConstants';
import {
  createCommandMarkdownLink,
  createHoverProvider,
  createInlineDecoration,
  createMarkdownString,
} from '@molecules/Monaco/editorHelpers';

interface HelmMatches {
  locationInValueFile: monaco.Range;
  uses: {
    filePath: string;
    range: monaco.Range;
  }[];
}

export const helmValueCodeIntel: CodeIntelApply = {
  name: 'helmValueFile',
  shouldApply: params => {
    return Boolean(getHelmValueFile(params.currentFile, params.helmValuesMap));
  },
  codeIntel: async params => {
    const helmValueFile = getHelmValueFile(params.currentFile, params.helmValuesMap);
    if (!helmValueFile || !params.helmChartMap) {
      return;
    }

    const helmChart = params.helmChartMap[helmValueFile.helmChartId];
    if (!helmChart) {
      return;
    }

    const placesUsed: HelmMatches[] = [];
    helmValueFile.values.forEach(helmValue => {
      const placeUsed: HelmMatches = {
        locationInValueFile: new monaco.Range(
          helmValue.linePosition.line,
          helmValue.linePosition.column,
          helmValue.linePosition.line,
          helmValue.linePosition.column + helmValue.linePosition.length
        ),
        uses: [],
      };
      helmChart.templateFilePaths.forEach(templateFilePath => {
        templateFilePath.values.forEach(value => {
          if (helmValue.keyPath !== value.value) {
            return;
          }
          placeUsed.uses.push({
            filePath: templateFilePath.filePath,
            range: new monaco.Range(
              value.range.startLineNumber,
              value.range.startColumn,
              value.range.endLineNumber,
              value.range.endColumn
            ),
          });
        });
      });
      if (placeUsed && placeUsed.uses.length) {
        placesUsed.push(placeUsed);
      }
    });

    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
    const newDisposables: monaco.IDisposable[] = [];

    placesUsed.forEach(placeUsed => {
      const commandMarkdownLinkList: monaco.IMarkdownString[] = [];

      newDecorations.push(createInlineDecoration(placeUsed.locationInValueFile, InlineDecorationTypes.SatisfiedRef));

      placeUsed.uses.forEach(use => {
        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink(
          `Go to ${use.filePath}`,
          'Select file',
          () => {
            goToFileAndHighlightCode({
              selectFilePath: params.selectFilePath,
              setEditorSelection: params.setEditorSelection,
              range: {
                startLineNumber: use.range.startLineNumber,
                startColumn: use.range.startColumn,
                endColumn: use.range.endColumn,
                endLineNumber: use.range.endLineNumber,
              },
              filePath: use.filePath,
            });
          }
        );
        commandMarkdownLinkList.push(commandMarkdownLink);
        newDisposables.push(commandDisposable);
      });

      const fileName = `file${placeUsed.uses.length === 1 ? '' : 's'}`;
      const hoverCommandMarkdownLinkList = [
        createMarkdownString(`Found this value in ${placeUsed.uses.length} ${fileName}`),
        ...commandMarkdownLinkList,
      ];
      if (commandMarkdownLinkList.length) {
        const hoverDisposable = createHoverProvider(placeUsed.locationInValueFile, hoverCommandMarkdownLinkList);
        newDisposables.push(hoverDisposable);
      }
    });

    return {
      newDecorations,
      newDisposables,
    };
  },
};
