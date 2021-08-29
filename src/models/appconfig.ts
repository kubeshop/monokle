import {ObjectNavigator} from './navigator';

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

interface AppConfig {
  /** a list of patterns to exclude when scanning the file system for resources */
  scanExcludes: string[];
  /** a list of patterns to match to against files for including */
  fileIncludes: string[];
  /** the currrent navigator configuration */
  navigators: ObjectNavigator[];
  /** absolute kubeconfig path */
  kubeconfigPath: string;
  /** if the startup modal is visible */
  isStartupModalVisible: boolean;
  settings: {
    theme: Themes; // not used for now
    textSize: TextSizes; // not used for now
    language: Languages; // not used for now
    filterObjectsOnSelection: boolean;
    autoZoomGraphOnSelection: boolean;
    helmPreviewMode: 'template' | 'install';
  };
}

export type {AppConfig};
