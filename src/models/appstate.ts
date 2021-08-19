import {HelmChart, HelmValuesFile} from '@models/helm';
import {FileEntry} from './fileentry';
import {K8sResource} from './k8sresource';

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

/**
 * Maps ids to Helm charts
 */
type HelmChartMapType = {
  [id: string]: HelmChart;
};

/**
 * Maps ids to Helm values files
 */
type HelmValuesMapType = {
  [id: string]: HelmValuesFile;
};

type PreviewLoaderType = {
  isLoading: boolean;
  targetResourceId?: string;
};

type ResourceSelectionHistoryEntry = {
  type: 'resource';
  selectedResourceId: string;
};

type PathSelectionHistoryEntry = {
  type: 'path';
  selectedPath: string;
};

type SelectionHistoryEntry = ResourceSelectionHistoryEntry | PathSelectionHistoryEntry;

interface AppState {
  fileMap: FileMapType; // maps filePath to FileEntry, filePath is relative to selected rootFolder
  resourceMap: ResourceMapType; // maps resource ids to resources
  helmChartMap: HelmChartMapType; // maps chart ids to helm charts
  helmValuesMap: HelmValuesMapType; // maps values ids to helm values files
  isApplyingResource: boolean; // if we are currently applying a resource - room for improvement...
  isSelectingFile: boolean; // if we are currently in the process of selecting a file - used for one-time UI updates
  currentSelectionHistoryIndex?: number; // index of current selection from the history, or undefined if last selection was not virtual
  selectionHistory: SelectionHistoryEntry[];
  selectedResourceId?: string; // the id of the currently selected resource
  selectedPath?: string; // the currently selected path
  selectedValuesFileId?: string; // the currently selected values file
  previewType?: 'kustomization' | 'cluster' | 'helm';
  previewLoader: PreviewLoaderType;
  previewResourceId?: string; // the resource currently being previewed
  previewValuesFileId?: string; // the values file currently being previewed
  diffResourceId?: string; // the resource currently being diffed
  diffContent?: string; // the diff content for the resource being diffed
}

export type {AppState, ResourceMapType, FileMapType, HelmChartMapType, HelmValuesMapType, PreviewLoaderType};
