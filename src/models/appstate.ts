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

interface AppState {
  fileMap: FileMapType; // maps filePath to FileEntry, filePath is relative to selected rootFolder
  resourceMap: ResourceMapType; // maps resource ids to resources
  selectedResourceId?: string; // the id of the currently selected resource
  selectedPath?: string; // the currently selected path
  previewType?: 'kustomization' | 'cluster' | 'helm';
  previewResourceId?: string; // the resource currently being previewed
  previewLoader: PreviewLoaderType;
  diffResource?: string; // the resource currently being diffed
  diffContent?: string; // the diff content for the resource being diffed
  helmChartMap: HelmChartMapType; // maps chart ids to helm charts
  helmValuesMap: HelmValuesMapType; // maps values ids to helm values files
  selectedValuesFile?: string; // the currently selected values file
  previewValuesFile?: string; // the values file currently being previewed
  isSelectingFile: boolean; // if we are currently in the process of selecting a file - used for one-time UI updates
  isApplyingResource: boolean; // if we are currently applying a resource - room for improvement...
}

export type {AppState, ResourceMapType, FileMapType, HelmChartMapType, HelmValuesMapType, PreviewLoaderType};
