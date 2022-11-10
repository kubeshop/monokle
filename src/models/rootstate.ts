import {
  AlertState,
  AppConfig,
  AppState,
  CompareState,
  ExtensionState,
  FormsState,
  GitSliceState,
  TerminalState,
  UiState,
  ValidationSliceState,
} from '@monokle-desktop/shared';

import {NavigatorState} from './navigator';

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
