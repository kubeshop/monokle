import {AppListenerFn} from '@redux/listeners/base';

import {getEditor, resetEditor} from '@editor/editor.instance';

export const editorDisposeListener: AppListenerFn = listen => {
  listen({
    predicate: (_, currentState, previousState) => {
      const currentSelection = currentState.main.selection;
      const previousSelection = previousState.main.selection;
      const wasSelectionCleared = currentSelection === undefined && previousSelection !== undefined;
      if (wasSelectionCleared) {
        return true;
      }
      return false;
    },
    effect() {
      resetEditor();
      const editor = getEditor();
      editor?.setModel(null);
    },
  });
};
