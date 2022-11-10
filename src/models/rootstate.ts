import {CompareState} from '@redux/compare';
import {FormsState} from '@redux/forms';

import {
  AlertState,
  AppConfig,
  AppState,
  ExtensionState,
  GitSliceState,
  ValidationSliceState,
} from '@monokle-desktop/shared';

import {NavigatorState} from './navigator';
import {TerminalState} from './terminal';
import {UiState} from './ui';

/**
 * This is the redux store root state
 * Exported to a separate file so we can use the RootState type in the main process without importing the store
 */
export type RootState = {
  form: FormsState;
  alert: AlertState;
  compare: CompareState;
  config: AppConfig;
  extension: ExtensionState;
  main: AppState;
  navigator: NavigatorState;
  terminal: TerminalState;
  ui: UiState;
  git: GitSliceState;
  validation: ValidationSliceState;
};
