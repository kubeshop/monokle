import {HelmChart, HelmValuesFile} from '@models/helm';
import {FileEntry} from './fileentry';
import {K8sResource} from './k8sresource';
import {NavSectionInstance} from './navsection';
import {MonoklePlugin} from './plugin';

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

type PreviewType = 'kustomization' | 'cluster' | 'helm';

type ResourceFilterType = {
  name?: string;
  kind?: string;
  namespace?: string;
  labels: Record<string, string | null>;
  annotations: Record<string, string | null>;
};

type ResourceRefsProcessingOptions = {
  /** if ref processing should ignore optional unsatisfied ref  */
  shouldIgnoreOptionalUnsatisfiedRefs: boolean;
};

interface AppState {
  /** maps filePath to FileEntry
   * - filePath is relative to selected rootFolder
   * - fileMap[**ROOT_FILE_ENTRY**] is the FileEntry for the rootFolder and it's **filePath is absolute**
   */
  fileMap: FileMapType;
  /** maps resource ids to resources */
  resourceMap: ResourceMapType;
  resourceFilter: ResourceFilterType;
  /** maps chart ids to helm charts */
  helmChartMap: HelmChartMapType;
  /** maps values ids to helm values files */
  helmValuesMap: HelmValuesMapType;
  /** if we are currently applying a resource - room for improvement... */
  isApplyingResource: boolean;
  /** if we are currently in the process of selecting a file - used for one-time UI updates */
  isSelectingFile: boolean;
  /** index of current selection from the history, or undefined if last selection was not virtual */
  currentSelectionHistoryIndex?: number;
  /** a list of previously selected resources of paths */
  selectionHistory: SelectionHistoryEntry[];
  /** the id of the currently selected resource */
  selectedResourceId?: string;
  /** the currently selected path */
  selectedPath?: string;
  /** the currently selected values file */
  selectedValuesFileId?: string;
  /** the current type of preview */
  previewType?: PreviewType;
  /** information used to load the preview */
  previewLoader: PreviewLoaderType;
  /** the resource currently being previewed */
  previewResourceId?: string;
  /** the values file currently being previewed */
  previewValuesFileId?: string;
  /** the resource currently being diffed */
  diffResourceId?: string;
  /** the diff content for the resource being diffed */
  diffContent?: string;
  plugins: MonoklePlugin[];
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions;
  navSectionInstancesById: Record<string, NavSectionInstance>;
}

export type {
  AppState,
  ResourceMapType,
  ResourceFilterType,
  FileMapType,
  HelmChartMapType,
  HelmValuesMapType,
  PreviewLoaderType,
  SelectionHistoryEntry,
  PreviewType,
  ResourceRefsProcessingOptions,
};
