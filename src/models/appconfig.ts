import {KustomizeCommandType} from '@redux/services/kustomize';

import {KubeConfig} from './kubeConfig';

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

export enum NewVersionCode {
  Errored = -2,
  NotAvailable = -1,
  Idle = 0,
  Checking = 1,
  Available = 2,
  Downloading = 3,
  Downloaded = 4,
}

interface AppConfig {
  /** a list of patterns to exclude when scanning the file system for resources */
  scanExcludes: string[];
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
  settings: {
    theme: Themes; // not used for now
    textSize: TextSizes; // not used for now
    language: Languages; // not used for now
    filterObjectsOnSelection: boolean;
    autoZoomGraphOnSelection: boolean;
    helmPreviewMode: 'template' | 'install';
    kustomizeCommand: KustomizeCommandType;
    loadLastFolderOnStartup: boolean;
  };
  recentFolders: string[];
  newVersion: {
    code: NewVersionCode;
    data: any;
  };
  kubeConfig: KubeConfig;
  os: NodeJS.Platform;
}

export type {AppConfig};
