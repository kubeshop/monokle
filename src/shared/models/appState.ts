import {AlertType} from './alert';
import {CurrentMatch, FileEntry} from './fileEntry';
import {HelmChart, HelmTemplate, HelmValuesFile} from './helm';
import {ImageType} from './image';
import {ValidationIntegration} from './integrations';
import {K8sResource, ResourceContent, ResourceMeta} from './k8sResource';
import {ObjectLocation} from './objectLocation';
import {Policy} from './policy';

export const isKubernetesObject = (obj: any): obj is KubernetesObject =>
  obj && typeof obj.apiVersion === 'string' && typeof obj.kind === 'string' && typeof obj.metadata?.name === 'string';

type AppState = {
  /** maps filePath to FileEntry
   * - filePath is relative to selected rootFolder
   * - fileMap[**ROOT_FILE_ENTRY**] is the FileEntry for the rootFolder and it's **.filePath is absolute**
   */
  fileMap: FileMapType;
  resourceMeta: {
    local: ResourceMetaMap;
    /* key is cluster context */
    cluster: Record<string, ResourceMetaMap>;
    /* key is helm preview id */
    helm: Record<string, ResourceMetaMap>;
    /* key is kustomize preview id */
    kustomize: Record<string, ResourceMetaMap>;
  };
  resourceContent: {
    local: ResourceContentMap;
    cluster: Record<string, ResourceContentMap>;
    helm: Record<string, ResourceContentMap>;
    kustomize: Record<string, ResourceContentMap>;
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
  selection: {
    location: ObjectLocation;
    isSelecting?: boolean;
    /* whether or not the editor should read the selectedPath file again - used when the file is updated externally */
    shouldEditorReload?: boolean;
    history: {
      currentLocations: ObjectLocation[];
      previousLocations: ObjectLocation[];
      index: number;
    };
  };
  highlight: {
    locations: ObjectLocation[];
  };
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
  resourceRefsProcessingOptions: ResourceRefsProcessingOptions;
  policies: {
    plugins: Policy[];
  };
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
type ResourceMetaMap = {
  [id: string]: ResourceMeta;
};

type ResourceContentMap = {
  [id: string]: ResourceContent;
};

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
  ResourceMetaMap,
  ResourceContentMap,
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
  PreviewType,
  ResourceRefsProcessingOptions,
};
