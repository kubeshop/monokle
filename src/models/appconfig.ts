import {KustomizeCommandType} from '@redux/services/kustomize';

export enum Themes {
  Dark = 'dark',
  Light = 'light',
}

export enum TextSizes {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

export enum Languages {
  English = 'en',
}

export type Settings = {
  theme: Themes; // not used for now
  textSize: TextSizes; // not used for now
  language: Languages; // not used for now
  filterObjectsOnSelection: boolean;
  autoZoomGraphOnSelection: boolean;
  helmPreviewMode: 'template' | 'install';
  kustomizeCommand: KustomizeCommandType;
  loadLastFolderOnStartup: boolean;
  hideExcludedFilesInFileExplorer: boolean;
};

export enum NewVersionCode {
  Errored = -2,
  NotAvailable = -1,
  Idle = 0,
  Checking = 1,
  Available = 2,
  Downloading = 3,
  Downloaded = 4,
}

export type KubeConfigContext = {
  cluster: string;
  name: string;
  user: string | null;
  namespace: string | null;
};

export type KubeConfig = {
  path?: string; // It can be `undefined` until refactor
  isPathValid?: boolean; // It can be `undefined` until refactor
  contexts?: Array<KubeConfigContext>;
  currentContext?: string;
};

export interface Project {
  name?: string;
  rootFolder: string;
  k8sVersion?: string;
  lastOpened?: string;
  settings?: Settings;
  kubeConfig?: KubeConfig;
  scanExcludes?: string[];
  isScanExcludesUpdated?: 'outdated' | 'applied';
  fileIncludes?: string[];
  folderReadsMaxDepth?: number;
}

interface AppConfig {
  /** a list of patterns to exclude when scanning the file system for resources */
  scanExcludes: string[];
  /**
   * Whether the scan excludes list is updated (actual)
   */
  isScanExcludesUpdated: 'outdated' | 'applied';
  /** a list of patterns to match to against files for including */
  fileIncludes: string[];
  /** maximum recursion depth when reading nested folders */
  folderReadsMaxDepth: number;
  /** absolute kubeconfig path */
  kubeconfigPath: string;
  /** is kubeconfig path valid */
  isKubeconfigPathValid: boolean;
  /** if the startup modal is visible */
  isStartupModalVisible: boolean;
  settings: Settings;
  recentFolders: string[];
  newVersion: {
    code: NewVersionCode;
    data: any;
  };
  kubeConfig: KubeConfig;
  osPlatform: NodeJS.Platform;
  projects: Project[];
  selectedProjectRootFolder: string | null;
}

export type {AppConfig};
