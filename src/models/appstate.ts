import { FileEntry } from './fileentry';
import { K8sResource } from './k8sresource';
import { AppConfig } from './appconfig';

type ResourceMapType = {
  [id: string]: K8sResource;
}

interface AppState {
  rootFolder: string,
  rootEntry: FileEntry,
  appConfig: AppConfig,
  resourceMap: ResourceMapType,
  selectedResource?: string,
  selectedPath?: string,
  previewResource?: string
}

export type {
  AppState, ResourceMapType,
};
