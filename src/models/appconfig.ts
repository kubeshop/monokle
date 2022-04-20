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

export type KubePermissions = {
  resourceName: string;
  verbs: string[];
};

export type ClusterAccessWithContext = ClusterAccess & {
  context: string;
};

export type ClusterAccess = {
  permissions: KubePermissions[];
  hasFullAccess: boolean;
  namespace: string;
};

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
  isPinned?: boolean;
};

export type PreviewConfigValuesFileItem = {
  /** the id is created by removing the file extension from the filePath */
  id: string;
  filePath: string;
  order: number;
  isChecked: boolean;
};

export type HelmPreviewConfiguration = {
  id: string;
  name: string;
  helmChartFilePath: string;
  command: 'install' | 'template';
  valuesFileItemMap: Record<string, PreviewConfigValuesFileItem | null>;
  options: Record<string, string | null>;
};

export type ProjectConfig = {
  settings?: Settings;
  kubeConfig?: KubeConfig;
  scanExcludes?: string[];
  fileIncludes?: string[];
  folderReadsMaxDepth?: number;
  clusterAccess?: ClusterAccessWithContext[];
  k8sVersion?: string;
  helm?: {
    previewConfigurationMap?: Record<string, HelmPreviewConfiguration | null>;
  };
  isAccessLoading?: boolean;
};

interface AppConfig {
  /** a list of patterns to exclude when scanning the file system for resources */
  scanExcludes: string[];
  /**
   * Whether the scan excludes list is updated (actual)
   */
  isScanExcludesUpdated: 'outdated' | 'applied';
  isScanIncludesUpdated: 'outdated' | 'applied';
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
  k8sVersion: string;
  favoriteTemplates: string[];
  disableEventTracking: boolean;
  disableErrorReporting: boolean;
}

export type {AppConfig};
