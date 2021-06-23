import {ObjectNavigator} from './navigator';

interface AppConfig {
  scanExcludes: string[];
  fileIncludes: string[];
  navigators: ObjectNavigator[];
  settings: {
    filterObjectsOnSelection: boolean;
    autoZoomGraphOnSelection: boolean;
  };
}

export type {AppConfig};
