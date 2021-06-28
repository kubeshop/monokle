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
  fileMap: FileMapType; // maps filePath to FileEntry, filePath is relative to selected rootFolder
  appConfig: AppConfig; // holds current configuratio
  resourceMap: ResourceMapType; // maps resource ids to resources
  selectedResource?: string; // the id of the currently selected resource
  selectedPath?: string; // the currently selected path
  previewResource?: string; // the resource currently being previewed
}

export type {AppState, ResourceMapType, FileMapType};
