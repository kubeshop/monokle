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
  scanExcludes: string[]; // a list of patterns to exclude when scanning the file system for resources
  fileIncludes: string[]; // a list of patterns to match to against files for including
  navigators: ObjectNavigator[]; // the currrent navigator configuration
  kubeconfig: string;
  settings: {
    theme: Themes;
    textSize: TextSizes;
    language: Languages;
    filterObjectsOnSelection: boolean;
    autoZoomGraphOnSelection: boolean;
    helmPreviewMode: 'template' | 'install';
  };
}

export type {AppConfig};
