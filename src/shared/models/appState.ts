import {AlertType} from './alert';
import {CurrentMatch, FileEntry} from './fileEntry';
import {HelmChart, HelmTemplate, HelmValuesFile} from './helm';
import {ImageType} from './image';
import {ValidationIntegration} from './integrations';
import {K8sResource, ResourceContentMap, ResourceMetaMap} from './k8sResource';
import {ClusterOrigin, LocalOrigin, PreviewOrigin} from './origin';
import {PreviewState} from './preview';
import {AppSelection} from './selection';

type AppState = {
  /** maps filePath to FileEntry
   * - filePath is relative to selected rootFolder
   * - fileMap[**ROOT_FILE_ENTRY**] is the FileEntry for the rootFolder and it's **filePath is absolute**
   */
  fileMap: FileMapType;
  resourceMetaStorage: {
    local: ResourceMetaMap<LocalOrigin>;
    cluster: ResourceMetaMap<ClusterOrigin>;
    preview: ResourceMetaMap<PreviewOrigin>;
  };
  resourceContentStorage: {
    local: ResourceContentMap<LocalOrigin>;
    cluster: ResourceContentMap<ClusterOrigin>;
    preview: ResourceContentMap<PreviewOrigin>;
  };
  selection?: AppSelection;
  selectionOptions: {
    isSelecting?: boolean;
    shouldEditorReload?: boolean;
  };
  highlights: AppSelection[];
  selectionHistory: {
    current: AppSelection[];
    previous: AppSelection[];
    index?: number;
  };
  preview: PreviewState;
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
  checkedResourceIds: string[];
  /** the line number for the match in file */
  search: {
    searchQuery: string;
    replaceQuery: string;
    queryMatchParams: MatchParamProps;
    currentMatch: CurrentMatch | null;
    searchHistory: string[];
  };
  /** the resource currently being diffed */
  resourceDiff: ResourceDiffType;
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions;
  notifications: AlertType[];
  /** type/value of filters that will be changed */
  filtersToBeChanged?: ResourceFilterType;
  registeredKindHandlers: string[];
  prevConfEditor: {
    isOpen: boolean;
    helmChartId?: string;
    previewConfigurationId?: string;
  };
  deviceID: string;
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

type MatchParamProps = {
  matchCase: boolean;
  matchWholeWord: boolean;
  regExp: boolean;
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
  MatchParamProps,
  PreviewLoaderType,
  PreviewType,
  ResourceRefsProcessingOptions,
};