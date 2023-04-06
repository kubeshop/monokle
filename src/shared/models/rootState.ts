import {AlertState} from './alert';
import {AppState} from './appState';
import {CompareState} from './compare';
import {AppConfig} from './config';
import {DashboardState} from './dashboard';
import {ExtensionState} from './extension';
import {FormsState} from './form';
import {GitSliceState} from './git';
import {TerminalState} from './terminal';
import {UiState} from './ui';
import {ValidationState} from './validation';

/**
 * This is the redux store root state
 * Exported to a separate file so we can use the RootState type in the main process without importing the store
 */
type RootState = {
  alert: AlertState;
  compare: CompareState;
  config: AppConfig;
  extension: ExtensionState;
  form: FormsState;
  git: GitSliceState;
  main: AppState;
  terminal: TerminalState;
  ui: UiState;
  validation: ValidationState;
  dashboard: DashboardState;
};

type ElectronMenuDataType = Pick<RootState, 'config'> & {
  config: Pick<RootState['config'], 'projects' | 'newVersion' | 'selectedProjectRootFolder'>;
} & Pick<RootState, 'main'> & {
    main: Pick<RootState['main'], 'selection' | 'preview'>;
  } & Pick<RootState, 'ui'> & {
    main: Pick<
      RootState['ui'],
      'isStartProjectPaneVisible' | 'isInQuickClusterMode' | 'isStartProjectPaneVisible' | 'monacoEditor'
    >;
  };

export type {RootState, ElectronMenuDataType};
