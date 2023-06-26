import {AlertState} from './alert';
import {AppState} from './appState';
import {ClusterState} from './clusterState';
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
  cluster: ClusterState;
};

type ElectronMenuDataType = {
  config: Pick<
    RootState['config'],
    'projects' | 'newVersion' | 'selectedProjectRootFolder' | 'kubeConfig' | 'projectConfig'
  >;
} & {
  main: Pick<RootState['main'], 'selection' | 'preview' | 'clusterConnection'>;
} & {
  ui: Pick<
    RootState['ui'],
    'isStartProjectPaneVisible' | 'isInQuickClusterMode' | 'isStartProjectPaneVisible' | 'monacoEditor' | 'leftMenu'
  >;
};

export type {RootState, ElectronMenuDataType};
