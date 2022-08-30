import {monaco} from 'react-monaco-editor';

import {createInlineDecoration} from '@molecules/Monaco/editorHelpers';

import {InlineDecorationTypes} from '../../editorConstants';

const applyLineDecorationIntel = (
  codeLine: number
): {
  decorations: monaco.editor.IModelDeltaDecoration[];
} => {
  const decoratedLines = [];
  if (codeLine) {
    decoratedLines.push(
      createInlineDecoration(new monaco.Range(codeLine, 0, codeLine, 0), InlineDecorationTypes.LastModified)
    );
  }
  return {decorations: decoratedLines};
};

export default applyLineDecorationIntel;
