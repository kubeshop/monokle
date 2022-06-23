import {monaco} from 'react-monaco-editor';

import {MatchNode} from '@models/fileentry';

import {CodeIntelApply} from '@molecules/Monaco/CodeIntel/types';
import {InlineDecorationTypes} from '@molecules/Monaco/editorConstants';
import {createInlineDecoration} from '@molecules/Monaco/editorHelpers';

export const fileWithMatchesIntel: CodeIntelApply = {
  name: 'fileMatches',
  shouldApply: () => {
    return true; // TODO: add a condition
  },
  codeIntel: async params => {
    const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];
    const newDisposables: monaco.IDisposable[] = [];

    const {matchOptions} = params;
    const {matchesInFile, currentMatchIdx = 0} = matchOptions || {};

    if (matchesInFile) {
      matchesInFile.forEach((match: MatchNode) => {
        newDecorations.push(
          createInlineDecoration(
            new monaco.Range(match.lineNumber, match.start, match.lineNumber, match.end),
            InlineDecorationTypes.Match
          )
        );
      });

      newDecorations.push(
        createInlineDecoration(
          new monaco.Range(
            matchesInFile[currentMatchIdx].lineNumber,
            matchesInFile[currentMatchIdx].start,
            matchesInFile[currentMatchIdx].lineNumber,
            matchesInFile[currentMatchIdx].end
          ),
          InlineDecorationTypes.CurrentMatch
        )
      );
    }

    return {
      newDecorations,
      newDisposables,
      currentSelection: matchesInFile && matchesInFile[currentMatchIdx],
    };
  },
};
