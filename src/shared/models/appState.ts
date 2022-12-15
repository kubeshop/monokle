import {AlertType} from './alert';
import {CurrentMatch, FileEntry} from './fileEntry';
import {HelmChart, HelmTemplate, HelmValuesFile} from './helm';
import {ImageType} from './image';
import {ValidationIntegration} from './integrations';
import {K8sResource} from './k8sResource';
import {Policy} from './policy';

export const isKubernetesObject = (obj: any): obj is KubernetesObject =>
  obj && typeof obj.apiVersion === 'string' && typeof obj.kind === 'string' && typeof obj.metadata?.name === 'string';

type AppState = {
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
  search: {
    searchQuery: string;
    replaceQuery: string;
    queryMatchParams: MatchParamProps;
    queryTemplateParams: MatchParamProps;
    currentMatch: CurrentMatch | null;
    searchHistory: string[];
  };
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
  /** the id of the currently being previewed command */
  previewCommandId?: string;
  /** the resource currently being diffed */
  resourceDiff: ResourceDiffType;
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions;
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
  lastChangedLine: number;
  isClusterConnected: boolean;
};

/**
 * Maps relative paths to FileEntries. The root folder FileEntry is mapped to "<root>"
 */
type FileMapType = {
  [id: string]: FileEntry;
};

type FiltersPresetsType = {
  [name: string]: ResourceFilterType;
};

/**
 * Maps ids to Helm charts
 */
type HelmChartMapType = {
  [id: string]: HelmChart;
};

type HelmTemplatesMapType = {
  [id: string]: HelmTemplate;
};

/**
 * Maps ids to Helm values files
 */
type HelmValuesMapType = {
  [id: string]: HelmValuesFile;
};

/**
 * List of images from current project
 */
type ImagesListType = ImageType[];

type ImageSelectionHistoryEntry = {
  type: 'image';
  selectedImage: ImageType;
};

type KubernetesObject = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    [x: string]: any;
  };
  [x: string]: any;
};

type MatchParamProps = {
  matchCase: boolean;
  matchWholeWord: boolean;
  regExp: boolean;
};

type PathSelectionHistoryEntry = {
  type: 'path';
  selectedPath: string;
};

type PreviewLoaderType = {
  isLoading: boolean;
  targetId?: string;
};

type PreviewType = 'kustomization' | 'cluster' | 'helm' | 'helm-preview-config' | 'command';

type ResourceDiffType = {
  targetResourceId?: string;
};

type ResourceFilterType = {
  names?: string[];
  kinds?: string[];
  namespace?: string;
  labels: Record<string, string | null>;
  annotations: Record<string, string | null>;
  fileOrFolderContainedIn?: string;
};

/**
 * Maps uuid:s to K8sResources
 */
type ResourceMapType = {
  [id: string]: K8sResource;
};

type ResourceRefsProcessingOptions = {
  /** if ref processing should ignore optional unsatisfied ref  */
  shouldIgnoreOptionalUnsatisfiedRefs: boolean;
};

type ResourceSelectionHistoryEntry = {
  type: 'resource';
  selectedResourceId: string;
};

type SelectionHistoryEntry = ResourceSelectionHistoryEntry | PathSelectionHistoryEntry | ImageSelectionHistoryEntry;

export type {
  AppState,
  ResourceMapType,
  ResourceFilterType,
  FiltersPresetsType,
  FileMapType,
  HelmChartMapType,
  HelmValuesMapType,
  HelmTemplatesMapType,
  ImagesListType,
  KubernetesObject,
  MatchParamProps,
  PreviewLoaderType,
  SelectionHistoryEntry,
  PreviewType,
  ResourceRefsProcessingOptions,
};
