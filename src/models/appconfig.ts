import {KustomizeCommandType} from '@models/kustomize';

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
  theme?: Themes; // not used for now
  textSize?: TextSizes; // not used for now
  language?: Languages; // not used for now
  filterObjectsOnSelection?: boolean;
  autoZoomGraphOnSelection?: boolean;
  helmPreviewMode?: 'template' | 'install';
  kustomizeCommand?: KustomizeCommandType;
  hideExcludedFilesInFileExplorer?: boolean;
  enableHelmWithKustomize?: boolean;
  createDefaultObjects?: boolean;
  setDefaultPrimitiveValues?: boolean;
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

// Parsed from kubernetes config file
export type KubeConfigContext = {
  cluster: string; // name of the cluster|context
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

export type Project = {
  name?: string;
  rootFolder: string;
  k8sVersion?: string;
  created?: string;
  lastOpened?: string;
};

export type ProjectConfig = {
  settings?: Settings;
  kubeConfig?: KubeConfig;
  scanExcludes?: string[];
  fileIncludes?: string[];
  folderReadsMaxDepth?: number;
  k8sVersion?: string;
};

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
  /** if the startup modal is visible */
  isStartupModalVisible: boolean;
  loadLastProjectOnStartup: boolean;
  isClusterSelectorVisible: boolean;
  settings: Settings;
  newVersion: {
    code: NewVersionCode;
    data: any;
  };
  kubeConfig: KubeConfig;
  osPlatform: NodeJS.Platform;
  projects: Project[];
  selectedProjectRootFolder: string | null;
  projectConfig?: ProjectConfig | null;
  userHomeDir?: string;
  userDataDir?: string;
  userTempDir?: string;
  isProjectLoading?: boolean;
  projectsRootPath: string;
}

export type {AppConfig};
