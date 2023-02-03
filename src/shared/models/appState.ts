import {AlertType} from './alert';
import {CurrentMatch, FileEntry} from './fileEntry';
import {HelmChart, HelmTemplate, HelmValuesFile} from './helm';
import {ImageType} from './image';
import {ValidationIntegration} from './integrations';
import {ResourceContentMapByStorage, ResourceIdentifier, ResourceMetaMapByStorage} from './k8sResource';
import {AnyPreview} from './preview';
import {AppSelection} from './selection';

type AppState = {
  /** maps filePath to FileEntry
   * - filePath is relative to selected rootFolder
   * - fileMap[**ROOT_FILE_ENTRY**] is the FileEntry for the rootFolder and it's **filePath is absolute**
   */
  fileMap: FileMapType;
  resourceMetaMapByStorage: ResourceMetaMapByStorage;
  resourceContentMapByStorage: ResourceContentMapByStorage;
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
  preview?: AnyPreview;
  previewOptions: {
    isLoading?: boolean;
  };
  clusterConnection?: {
    context: string;
    kubeConfigPath: string;
    namespace: string;
  };
  clusterConnectionOptions: {
    isLoading?: boolean;
    lastNamespaceLoaded?: string;
  };
  checkedResourceIdentifiers: ResourceIdentifier[];

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
  // TODO: imagesList should probably be transformed to a map "imageMap"
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

type ResourceDiffType = {
  targetResourceId?: string;
};

type ResourceFilterType = {
  name?: string;
  kinds?: string[];
  namespaces?: string[];
  labels: Record<string, string | null>;
  annotations: Record<string, string | null>;
  fileOrFolderContainedIn?: string;
};

type ResourceRefsProcessingOptions = {
  /** if ref processing should ignore optional unsatisfied ref  */
  shouldIgnoreOptionalUnsatisfiedRefs: boolean;
};

export type {
  AppState,
  ResourceFilterType,
  FiltersPresetsType,
  FileMapType,
  HelmChartMapType,
  HelmValuesMapType,
  HelmTemplatesMapType,
  ImagesListType,
  MatchParamProps,
  PreviewLoaderType,
  ResourceRefsProcessingOptions,
};
