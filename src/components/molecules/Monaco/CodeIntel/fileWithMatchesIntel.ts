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
    const currentMatchItem: MatchNode = matchOptions?.currentMatchItem || ({} as MatchNode);

    if (matchOptions?.matchLines) {
      matchOptions.matchLines.forEach((matchArr: MatchNode[]) => {
        matchArr.forEach((match: MatchNode) => {
          newDecorations.push(
            createInlineDecoration(
              new monaco.Range(match.lineNumber, match.start, match.lineNumber, match.end),
              InlineDecorationTypes.Match
            )
          );
        });
      });
    }

    newDecorations.push(
      createInlineDecoration(
        new monaco.Range(
          currentMatchItem.lineNumber,
          currentMatchItem.start,
          currentMatchItem.lineNumber,
          currentMatchItem.end
        ),
        InlineDecorationTypes.CurrentMatch
      )
    );

    return {
      newDecorations,
      newDisposables,
      currentSelection: matchOptions?.currentMatchItem,
    };
  },
};
