import {AlertType} from './alert';
import {CurrentMatch, FileEntry} from './fileEntry';
import {HelmChart, HelmTemplate, HelmValuesFile} from './helm';
import {ImageType} from './image';
import {ValidationIntegration} from './integrations';
import {ResourceContentMap, ResourceMetaMap} from './k8sResource';
import {ClusterOrigin, HelmOrigin, KustomizeOrigin, LocalOrigin} from './origin';
import {AppSelection} from './selection';

type AppState = {
  /** maps filePath to FileEntry
   * - filePath is relative to selected rootFolder
   * - fileMap[**ROOT_FILE_ENTRY**] is the FileEntry for the rootFolder and it's **.filePath is absolute**
   */
  fileMap: FileMapType;
  resourceMetaStorage: {
    local: ResourceMetaMap<LocalOrigin>;
    /* key is cluster context */
    cluster: Record<string, ResourceMetaMap<ClusterOrigin>>;
    /* key is helm preview id */
    helm: Record<string, ResourceMetaMap<HelmOrigin>>;
    /* key is kustomize preview id */
    kustomize: Record<string, ResourceMetaMap<KustomizeOrigin>>;
  };
  resourceContentStorage: {
    local: ResourceContentMap<LocalOrigin>;
    cluster: Record<string, ResourceContentMap<ClusterOrigin>>;
    helm: Record<string, ResourceContentMap<HelmOrigin>>;
    kustomize: Record<string, ResourceContentMap<KustomizeOrigin>>;
  };
  selection?: AppSelection;
  selectionOptions: {
    isSelecting?: boolean;
    shouldEditorReload?: boolean;
  };
  highlight: {
    selections: AppSelection[];
  };
  selectionHistory: {
    current: AppSelection[];
    previous: AppSelection[];
    index?: number;
  };
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
  /** a list of checked resources for multi-resource actions */
  checkedResourceIds: string[];
  /** the line number for the match in file */
  search: {
    searchQuery: string;
    replaceQuery: string;
    queryMatchParams: MatchParamProps;
    currentMatch: CurrentMatch | null;
    searchHistory: string[];
  };
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

export type {
  AppSelection,
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
  PreviewType,
};
