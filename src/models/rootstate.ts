import {CompareState} from '@redux/compare';
import {FormsState} from '@redux/forms';

import {AlertState} from './alert';
import {AppConfig} from './appconfig';
import {AppState} from './appstate';
import {ExtensionState} from './extension';
import {GitSliceState} from './git';
import {LogsState} from './logs';
import {NavigatorState} from './navigator';
import {TerminalState} from './terminal';
import {UiState} from './ui';
import {UiCoachState} from './uiCoach';

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
  logs: LogsState;
  main: AppState;
  navigator: NavigatorState;
  terminal: TerminalState;
  ui: UiState;
  uiCoach: UiCoachState;
  git: GitSliceState;
};
