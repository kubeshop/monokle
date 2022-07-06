import {HelmChart, HelmTemplate, HelmValuesFile} from '@models/helm';

import {AlertType} from './alert';
import {CurrentMatch, FileEntry} from './fileentry';
import {ImageType} from './image';
import {ValidationIntegration} from './integrations';
import {K8sResource} from './k8sresource';
import {Policy} from './policy';

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
 * List of images from current project
 */

type ImagesListType = ImageType[];

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

type HelmTemplatesMapType = {
  [id: string]: HelmTemplate;
};

type PreviewLoaderType = {
  isLoading: boolean;
  targetId?: string;
};

type FiltersPresetsType = {
  [name: string]: ResourceFilterType;
};

type ResourceDiffType = {
  targetResourceId?: string;
};

type ResourceSelectionHistoryEntry = {
  type: 'resource';
  selectedResourceId: string;
};

type ImageSelectionHistoryEntry = {
  type: 'image';
  selectedImage: ImageType;
};

type PathSelectionHistoryEntry = {
  type: 'path';
  selectedPath: string;
};

type SelectionHistoryEntry = ResourceSelectionHistoryEntry | PathSelectionHistoryEntry | ImageSelectionHistoryEntry;

type PreviewType = 'kustomization' | 'cluster' | 'helm' | 'helm-preview-config';

type ResourceFilterType = {
  name?: string;
  kinds?: string[];
  namespace?: string;
  labels: Record<string, string | null>;
  annotations: Record<string, string | null>;
  fileOrFolderContainedIn?: string;
};

type ResourceRefsProcessingOptions = {
  /** if ref processing should ignore optional unsatisfied ref  */
  shouldIgnoreOptionalUnsatisfiedRefs: boolean;
};

type ClusterToLocalResourcesMatch = {
  id: string;
  resourceKind: string;
  resourceName: string;
  resourceNamespace: string;
  clusterResourceId?: string;
  localResourceIds?: string[];
};

interface AppState {
  /** maps filePath to FileEntry
   * - filePath is relative to selected rootFolder
   * - fileMap[**ROOT_FILE_ENTRY**] is the FileEntry for the rootFolder and it's **filePath is absolute**
   */
  fileMap: FileMapType;
  /** maps resource ids to resources */
  resourceMap: ResourceMapType;
  /**
   * Whether the app's storage is rehydrating
   */
  isRehydrating: boolean;
  /**
   * Whether the app's storage was rehydrated
   */
  wasRehydrated: boolean;
  resourceFilter: ResourceFilterType;
  /** maps chart ids to helm charts */
  helmChartMap: HelmChartMapType;
  /** maps values ids to helm values files */
  helmValuesMap: HelmValuesMapType;
  /** maps values ids to helm templates */
  helmTemplatesMap: HelmTemplatesMapType;
  /** if we are currently applying a resource - room for improvement... */
  isApplyingResource: boolean;
  /** if we are currently in the process of selecting a file - used for one-time UI updates */
  isSelectingFile: boolean;
  /** index of current selection from the history, or undefined if last selection was not virtual */
  currentSelectionHistoryIndex?: number;
  /** a list of previously selected resources of paths */
  selectionHistory: SelectionHistoryEntry[];
  /** the previous list of previously selected resources of paths */
  previousSelectionHistory: SelectionHistoryEntry[];
  /** the id of the currently selected resource */
  selectedResourceId?: string;
  /** a list of checked resources for multi-resource actions */
  checkedResourceIds: string[];
  /** the currently selected path */
  selectedPath?: string;
  /** the line number for the match in file */
  matchOptions?: CurrentMatch | null;
  /** the currently selected values file */
  selectedValuesFileId?: string;
  /** the currently selected preview configuration */
  selectedPreviewConfigurationId?: string;
  /** the current type of preview */
  previewType?: PreviewType;
  /** information used to load the preview */
  previewLoader: PreviewLoaderType;
  /** the resource currently being previewed */
  previewResourceId?: string;
  /** the kubeconfig path for current cluster preview */
  previewKubeConfigPath?: string;
  /** the kubeconfig context for current cluster preview */
  previewKubeConfigContext?: string;
  /** the values file currently being previewed */
  previewValuesFileId?: string;
  /** the preview configuration currently being previewed */
  previewConfigurationId?: string;
  /** the resource currently being diffed */
  resourceDiff: ResourceDiffType;
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions;
  clusterDiff: {
    hasLoaded: boolean;
    hasFailed: boolean;
    shouldReload?: boolean;
    hideClusterOnlyResources: boolean;
    clusterToLocalResourcesMatches: ClusterToLocalResourcesMatch[];
    diffResourceId?: string;
    refreshDiffResource?: boolean;
    selectedMatches: string[];
  };
  policies: {
    plugins: Policy[];
  };
  notifications: AlertType[];
  /** whether or not the editor should read the selectedPath file again - used when the file is updated externally */
  shouldEditorReloadSelectedPath: boolean;
  /** type/value of filters that will be changed */
  filtersToBeChanged?: ResourceFilterType;
  registeredKindHandlers: string[];
  prevConfEditor: {
    isOpen: boolean;
    helmChartId?: string;
    previewConfigurationId?: string;
  };
  deviceID: string;
  selectedImage?: ImageType | null;
  imagesSearchedValue?: string;
  filtersPresets: FiltersPresetsType;
  imagesList: ImagesListType;
  validationIntegration: ValidationIntegration | undefined;
  autosaving: {
    status?: boolean;
    error?: {
      message: string;
      stack: string;
    };
  };
}

export interface KubernetesObject {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    [x: string]: any;
  };
  [x: string]: any;
}

export const isKubernetesObject = (obj: any): obj is KubernetesObject =>
  obj && typeof obj.apiVersion === 'string' && typeof obj.kind === 'string' && typeof obj.metadata?.name === 'string';

export type {
  AppState,
  ResourceMapType,
  ResourceFilterType,
  FiltersPresetsType,
  FileMapType,
  ImagesListType,
  HelmChartMapType,
  HelmValuesMapType,
  HelmTemplatesMapType,
  PreviewLoaderType,
  SelectionHistoryEntry,
  PreviewType,
  ResourceRefsProcessingOptions,
  ClusterToLocalResourcesMatch,
};
