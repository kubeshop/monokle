import {FileEntry} from './fileentry';
import {K8sResource} from './k8sresource';
import {AppConfig} from './appconfig';

/**
 * Maps uuid:s to K8sResources
 */
type ResourceMapType = {
  [id: string]: K8sResource;
};

/**
 * Maps relative paths to FileEntries. The root folder FileEntry is mapped to "<root>"
 */
type FileMapType = {
  [id: string]: FileEntry;
};

interface AppState {
  fileMap: FileMapType; // maps filePath to FileEntry, filePath is relative to selected rootFolder
  appConfig: AppConfig; // holds current configuration
  resourceMap: ResourceMapType; // maps resource ids to resources
  selectedResource?: string; // the id of the currently selected resource
  selectedPath?: string; // the currently selected path
  previewResource?: string; // the resource currently being previewed
  diffResource?: string; // the resource currently being diffed
  diffContent?: string; // the diff content for the resource being diffed
}

export type {AppState, ResourceMapType, FileMapType};
