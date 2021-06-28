import {FileEntry} from './fileentry';
import {K8sResource} from './k8sresource';
import {AppConfig} from './appconfig';

type ResourceMapType = {
  [id: string]: K8sResource;
};

type FileMapType = {
  [id: string]: FileEntry;
};

interface AppState {
  fileMap: FileMapType;
  appConfig: AppConfig;
  resourceMap: ResourceMapType;
  selectedResource?: string;
  selectedPath?: string;
  previewResource?: string;
}

export type {AppState, ResourceMapType, FileMapType};
