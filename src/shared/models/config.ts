import {Cluster, Context, User} from '@kubernetes/client-node';

import {ClusterColors} from './cluster';
import {KustomizeCommandType} from './kustomize';

export enum Languages {
  English = 'en',
}

export enum NewVersionCode {
  Errored = -2,
  NotAvailable = -1,
  Idle = 0,
  Checking = 1,
  Available = 2,
  Downloading = 3,
  Downloaded = 4,
}

export enum SettingsPanel {
  ValidationSettings = 'validation',
  GlobalSettings = 'global-settings',
  DefaultProjectSettings = 'default-project-settings',
  CurrentProjectSettings = 'current-project-settings',
  PluginsManager = 'plugins-manager',
}

export enum TextSizes {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

export enum Themes {
  Dark = 'dark',
  Light = 'light',
}

// String union type for the supported API key vendors, currently only OpenAI
export type ApiKeyVendor = 'OpenAI';

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
  loadLastProjectOnStartup: boolean;
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
  userCrdsDir?: string;
  isProjectLoading?: boolean;
  projectsRootPath: string;
  k8sVersion: string;
  favoriteTemplates: string[];
  disableEventTracking: boolean;
  disableErrorReporting: boolean;
  isAccessLoading?: boolean;
  kubeConfigContextsColors: {
    [name: string]: ClusterColors;
  };
  fileExplorerSortOrder: FileExplorerSortOrder;
  isNewVersionAvailable: boolean;
  userApiKeys: {
    [vendor in ApiKeyVendor]: string;
  };
}

type FileExplorerSortOrder = 'folders' | 'files' | 'mixed';

type HelmPreviewConfiguration = {
  id: string;
  name: string;
  helmChartFilePath: string;
  command: 'install' | 'template';
  valuesFileItemMap: Record<string, PreviewConfigValuesFileItem | null>;
  options: Record<string, string | null>;
};

type KubeConfig = {
  path?: string; // It can be `undefined` until refactor

  /**
   * @deprecated
   */
  isPathValid?: boolean; // It can be `undefined` until refactor

  /**
   * @deprecated
   */
  contexts?: Array<KubeConfigContext>;

  /**
   * @deprecated
   */
  currentContext?: string;
};

export type ModernKubeConfig = InvalidKubeConfig | ValidKubeConfig;

export type ValidKubeConfig = {
  isValid: true;
  path: string;
  currentContext: string;
  contexts: Context[];
  clusters: Cluster[];
  users: User[];
};

export type InvalidKubeConfig = {
  isValid: false;
  path: string;
  code: 'not_found' | 'malformed' | 'unknown' | 'empty' | 'not_file';
  reason: string;
};

// Parsed from kubernetes config file
type KubeConfigContext = {
  cluster: string; // name of the cluster|context
  name: string;
  user: string | null;
  namespace: string | null;
};

type KubePermissions = {
  resourceKind: string;
  verbs: string[];
};

type PreviewConfigValuesFileItem = {
  /** the id is created by removing the file extension from the filePath */
  id: string;
  filePath: string;
  order: number;
  isChecked: boolean;
};

type Project = {
  name?: string;
  rootFolder: string;
  k8sVersion?: string;
  created?: string;
  lastOpened?: string;
  isPinned?: boolean;
  isGitRepo?: boolean;
};

type ProjectConfig = {
  settings?: Settings;
  kubeConfig?: KubeConfig;
  scanExcludes?: string[];
  fileIncludes?: string[];
  folderReadsMaxDepth?: number;
  k8sVersion?: string;
  helm?: {
    previewConfigurationMap?: Record<string, HelmPreviewConfiguration | null>;
  };
  savedCommandMap?: Record<string, SavedCommand | null>;
};

type SavedCommand = {
  id: string;
  label: string;
  content: string;
};

type Settings = {
  theme?: Themes; // not used for now
  textSize?: TextSizes; // not used for now
  language?: Languages; // not used for now
  filterObjectsOnSelection?: boolean;
  autoZoomGraphOnSelection?: boolean;
  helmPreviewMode?: 'template' | 'install';
  kustomizeCommand?: KustomizeCommandType;
  enableHelmWithKustomize?: boolean;
  createDefaultObjects?: boolean;
  setDefaultPrimitiveValues?: boolean;
  allowEditInClusterMode?: boolean;
  hideEditorPlaceholder?: boolean;
};

export type {
  AppConfig,
  FileExplorerSortOrder,
  HelmPreviewConfiguration,
  KubeConfig,
  KubeConfigContext,
  KubePermissions,
  PreviewConfigValuesFileItem,
  Project,
  ProjectConfig,
  SavedCommand,
  Settings,
};
