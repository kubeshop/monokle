import {monaco} from 'react-monaco-editor';
import {ResourceMapType} from '@models/appstate';
import {isUnsatisfiedRef} from '@redux/utils/resourceRefs';

import {GlyphDecorationTypes, InlineDecorationTypes} from './editorConstants';

import {
  createCommandMarkdownLink,
  createGlyphDecoration,
  createInlineDecoration,
  createHoverProvider,
  createMarkdownString,
  getRangeForTarget,
  getLine,
} from './editorHelpers';

export function handleUnsatisfiedRefs(
  editor: monaco.editor.IStandaloneCodeEditor,
  resourceMap: ResourceMapType,
  selectedResourceId: string
) {
  const resource = resourceMap[selectedResourceId];
  const unsatisfiedRefs = resource.refs?.filter(r => isUnsatisfiedRef(r.refType));

  const newHoverDisposables: monaco.IDisposable[] = [];
  const newCommandDisposables: monaco.IDisposable[] = [];

  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

  if (!unsatisfiedRefs || unsatisfiedRefs.length === 0) {
    return {newDecorations, newHoverDisposables, newCommandDisposables};
  }

  for (let i = 0; i < unsatisfiedRefs?.length; i += 1) {
    const unsatisfiedRef = unsatisfiedRefs[i];

    const line = getLine(editor, unsatisfiedRef.target);

    if (line) {
      const glyphDecoration = createGlyphDecoration(line.index, GlyphDecorationTypes.UnsatisfiedRef);
      newDecorations.push(glyphDecoration);

      const inlineRange = getRangeForTarget(line, unsatisfiedRef.target);
      if (inlineRange) {
        const inlineDecoration = createInlineDecoration(inlineRange, InlineDecorationTypes.UnsatisfiedRef);
        newDecorations.push(inlineDecoration);

        const {commandMarkdownLink, commandDisposable} = createCommandMarkdownLink('Some link', () => {
          alert('Clicked on link!');
        });

        const hoverDisposable = createHoverProvider(inlineRange, [
          createMarkdownString('Some title'),
          commandMarkdownLink,
        ]);
        newHoverDisposables.push(hoverDisposable);
        newCommandDisposables.push(commandDisposable);
      }
    }
  }

  return {newDecorations, newHoverDisposables, newCommandDisposables};
}

export default {
  handleUnsatisfiedRefs,
};
