import {isAnyOf} from '@reduxjs/toolkit';

import {AppListenerFn} from '@redux/listeners/base';
import {processResourceRefs} from '@redux/parsing/parser.thunks';
import {editorResourceIdentifierSelector} from '@redux/selectors/resourceSelectors';
import {validateResources} from '@redux/validation/validation.thunks';

import {getEditor, resetEditor} from '@editor/editor.instance';
import {applyEditorRefs} from '@editor/enhancers/k8sResource/refs';
import {applyEditorValidation} from '@editor/enhancers/k8sResource/validation';

export const editorResourceRefsListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(processResourceRefs.fulfilled),
    async effect(_action, {getState, delay, cancelActiveListeners, dispatch}) {
      cancelActiveListeners();
      await delay(1);

      const editorResourceIdentifier = editorResourceIdentifierSelector(getState());
      resetEditor();

      const editor = getEditor();
      if (!editor) {
        return;
      }
      applyEditorRefs({state: getState(), resourceIdentifier: editorResourceIdentifier, editor, dispatch});
    },
  });
};

export const editorValidationListener: AppListenerFn = listen => {
  listen({
    matcher: isAnyOf(validateResources.fulfilled),
    async effect(_action, {getState, delay, cancelActiveListeners, dispatch}) {
      cancelActiveListeners();
      await delay(1);

      const editorResourceIdentifier = editorResourceIdentifierSelector(getState());
      const editor = getEditor();
      if (!editor) {
        return;
      }
      applyEditorValidation({state: getState(), resourceIdentifier: editorResourceIdentifier, editor, dispatch});
    },
  });
};
