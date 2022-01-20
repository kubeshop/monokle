import {AlertState} from './alert';
import {AppConfig} from './appconfig';
import {AppState} from './appstate';
import {ExtensionState} from './extension';
import {LogsState} from './logs';
import {NavigatorState} from './navigator';
import {UiState} from './ui';
import {UiCoachState} from './uiCoach';

/**
 * This is the redux store root state
 * Exported to a separate file so we can use the RootState type in the main process without importing the store
 */
export type RootState = {
  config: AppConfig;
  main: AppState;
  alert: AlertState;
  logs: LogsState;
  ui: UiState;
  navigator: NavigatorState;
  uiCoach: UiCoachState;
  extension: ExtensionState;
};
