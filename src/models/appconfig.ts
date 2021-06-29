import {ObjectNavigator} from './navigator';

interface AppConfig {
  scanExcludes: string[]; // a list of patterns to exclude when scanning the file system for resources
  fileIncludes: string[]; // a list of patterns to match to against files for including
  navigators: ObjectNavigator[]; // the currrent navigator configuration
  settings: {
    filterObjectsOnSelection: boolean;
    autoZoomGraphOnSelection: boolean;
  };
}

export type {AppConfig};
