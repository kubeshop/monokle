import {AppListenerFn} from '@redux/listeners/base';

import {editorSelectionListener} from './editorSelection.listener';
import {editorTextUpdateListener} from './editorTextUpdate.listener';
import {editorResourceRefsListener, editorValidationListener} from './editorValidation.listener';

export const editorListeners: AppListenerFn[] = [
  editorSelectionListener,
  editorTextUpdateListener,
  editorResourceRefsListener,
  editorValidationListener,
];
