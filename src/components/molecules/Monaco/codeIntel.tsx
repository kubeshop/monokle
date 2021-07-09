import {monaco} from 'react-monaco-editor';
import {ResourceMapType} from '@models/appstate';
import {isUnsatisfiedRef} from '@redux/utils/resourceRefs';

import {
  createGlyphDecoration,
  createInlineDecoration,
  createInlineHoverPopup,
  getInlineRangeForTarget,
  getLine,
} from './editorHelpers';

export function handleUnsatisfiedRefs(
  editor: monaco.editor.IStandaloneCodeEditor,
  resourceMap: ResourceMapType,
  selectedResourceId: string
) {
  const resource = resourceMap[selectedResourceId];
  const unsatisfiedRefs = resource.refs?.filter(r => isUnsatisfiedRef(r.refType));

  const hoverDisposables: monaco.IDisposable[] = [];
  const commandDisposables: monaco.IDisposable[] = [];

  const decorations: monaco.editor.IModelDeltaDecoration[] = [];

  if (!unsatisfiedRefs || unsatisfiedRefs.length === 0) {
    return {decorations, hoverDisposables, commandDisposables};
  }

  for (let i = 0; i < unsatisfiedRefs?.length; i += 1) {
    const unsatisfiedRef = unsatisfiedRefs[i];

    const line = getLine(editor, unsatisfiedRef.target);

    if (line) {
      const glyphDecoration = createGlyphDecoration(line.index);
      decorations.push(glyphDecoration);

      const inlineRange = getInlineRangeForTarget(line, unsatisfiedRef.target);
      if (inlineRange) {
        const inlineDecoration = createInlineDecoration(inlineRange);
        decorations.push(inlineDecoration);

        const {hoverDisposable, commandDisposable} = createInlineHoverPopup(inlineRange);
        hoverDisposables.push(hoverDisposable);
        commandDisposables.push(commandDisposable);
      }
    }
  }

  return {decorations, hoverDisposables, commandDisposables};
}

export default {
  handleUnsatisfiedRefs,
};
