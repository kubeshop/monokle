import * as monaco from 'monaco-editor';

import {selectedHelmValuesSelector} from '@redux/selectors';

import {InlineDecorationTypes} from '@editor/editor.constants';
import {addEditorCommand, addEditorDecorations, addEditorHover} from '@editor/editor.instance';
import {EditorCommand} from '@editor/editor.types';
import {createInlineDecoration} from '@editor/editor.utils';
import {HelmTemplatesMapType} from '@shared/models/appState';
import {HelmChart, HelmValuesFile} from '@shared/models/helm';

import {createEditorEnhancer} from '../createEnhancer';
import {goToFileAndHighlightCode} from './utils';

interface HelmMatches {
  locationInValueFile: monaco.Range;
  uses: {
    filePath: string;
    range: monaco.Range;
  }[];
}

export const helmValuesFileEnhancer = createEditorEnhancer(({state, resourceIdentifier, dispatch}) => {
  if (resourceIdentifier) {
    return;
  }
  const helmValuesFile = selectedHelmValuesSelector(state);
  if (!helmValuesFile) {
    return;
  }
  const helmChart = state.main.helmChartMap[helmValuesFile.helmChartId];
  if (!helmChart) {
    return;
  }
  const placesUsed = findWhereHelmValuesAreUsed(helmValuesFile, helmChart, state.main.helmTemplatesMap);
  const decorations: monaco.editor.IModelDeltaDecoration[] = [];

  placesUsed.forEach(placeUsed => {
    const commands: EditorCommand[] = [];
    decorations.push(createInlineDecoration(placeUsed.locationInValueFile, InlineDecorationTypes.SatisfiedRef));
    placeUsed.uses.forEach(use => {
      const newCommand = addEditorCommand({
        type: 'go_to_helm_template_file',
        text: `${use.filePath}`,
        altText: 'Select file',
        beforeText: 'Found in: ',
        afterText: `at Ln ${use.range.startLineNumber}`,
        handler: () => {
          goToFileAndHighlightCode({
            state,
            range: {
              startLineNumber: use.range.startLineNumber,
              startColumn: use.range.startColumn,
              endColumn: use.range.endColumn,
              endLineNumber: use.range.endLineNumber,
            },
            filePath: use.filePath,
            dispatch,
          });
        },
      });
      commands.push(newCommand);
    });

    if (commands.length) {
      addEditorHover({
        range: placeUsed.locationInValueFile,
        contents: commands.map(c => c.markdownLink),
      });
    }
  });

  addEditorDecorations(decorations);
});

const findWhereHelmValuesAreUsed = (
  helmValuesFile: HelmValuesFile,
  helmChart: HelmChart,
  helmTemplatesMap: HelmTemplatesMapType
) => {
  const placesUsed: HelmMatches[] = [];
  helmValuesFile.values.forEach(helmValue => {
    const placeUsed: HelmMatches = {
      locationInValueFile: new monaco.Range(
        helmValue.linePosition.line,
        helmValue.linePosition.column,
        helmValue.linePosition.line,
        helmValue.linePosition.column + helmValue.linePosition.length
      ),
      uses: [],
    };

    helmChart.templateIds.forEach(id => {
      const helmTemplate = helmTemplatesMap[id];

      if (!helmTemplate) {
        return;
      }

      helmTemplate.values.forEach(value => {
        if (helmValue.keyPath !== value.value) {
          return;
        }

        placeUsed.uses.push({
          filePath: helmTemplate.filePath,
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
  return placesUsed;
};
