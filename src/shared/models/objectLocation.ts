const CLUSTER_CONTEXT_LOCATION_TYPE = 'cluster.context' as const;
const CLUSTER_RESOURCE_LOCATION_TYPE = 'cluster.resource' as const;
const COMMAND_LOCATION_TYPE = 'command' as const;
const HELM_CHART_LOCATION_TYPE = 'helm.chart' as const;
const HELM_PREVIEW_RESOURCE_LOCATION_TYPE = 'helm.preview.resource' as const;
const HELM_PREVIEW_CONFIGURATION_LOCATION_TYPE = 'helm.preview.configuration' as const;
const HELM_VALUES_FILE_LOCATION_TYPE = 'helm.values.file' as const;
const IMAGE_LOCATION_TYPE = 'image' as const;
const KUSTOMIZE_KUSTOMIZATION_LOCATION_TYPE = 'kustomize.kustomization' as const;
const KUSTOMIZE_PREVIEW_RESOURCE_LOCATION_TYPE = 'kustomize.preview.resource' as const;
const LOCAL_FILE_LOCATION_TYPE = 'local.file' as const;
const LOCAL_RESOURCE_LOCATION_TYPE = 'local.resource' as const;

export type ClusterContextLocation = {
  type: typeof CLUSTER_CONTEXT_LOCATION_TYPE;
  target: string;
};
export type ClusterResourceLocation = {
  type: typeof CLUSTER_RESOURCE_LOCATION_TYPE;
  target: string;
};
export type CommandLocation = {
  type: typeof COMMAND_LOCATION_TYPE;
  target: string;
};
export type HelmChartLocation = {
  type: typeof HELM_CHART_LOCATION_TYPE;
  target: string;
};
export type HelmPreviewResourceLocation = {
  type: typeof HELM_PREVIEW_RESOURCE_LOCATION_TYPE;
  target: string;
};
export type HelmPreviewConfigurationLocation = {
  type: typeof HELM_PREVIEW_CONFIGURATION_LOCATION_TYPE;
  target: string;
};
export type HelmValuesFileLocation = {
  type: typeof HELM_VALUES_FILE_LOCATION_TYPE;
  target: string;
};
export type ImageLocation = {
  type: typeof IMAGE_LOCATION_TYPE;
  target: string;
};
export type KustomizeKustomizationLocation = {
  type: typeof KUSTOMIZE_KUSTOMIZATION_LOCATION_TYPE;
  target: string;
};
export type KustomizePreviewResourceLocation = {
  type: typeof KUSTOMIZE_PREVIEW_RESOURCE_LOCATION_TYPE;
  target: string;
};
export type LocalFileLocation = {
  type: typeof LOCAL_FILE_LOCATION_TYPE;
  target: string;
};
export type LocalResourceLocation = {
  type: typeof LOCAL_RESOURCE_LOCATION_TYPE;
  target: string;
};

export type FileLocation = HelmValuesFileLocation | LocalFileLocation;

export type PreviewResourceLocation = HelmPreviewResourceLocation | KustomizePreviewResourceLocation;

export type ResourceLocation = ClusterResourceLocation | LocalResourceLocation | PreviewResourceLocation;

export type ObjectLocation =
  | ClusterContextLocation
  | ClusterResourceLocation
  | CommandLocation
  | HelmChartLocation
  | HelmPreviewResourceLocation
  | HelmPreviewConfigurationLocation
  | HelmValuesFileLocation
  | ImageLocation
  | KustomizeKustomizationLocation
  | KustomizePreviewResourceLocation
  | LocalFileLocation
  | LocalResourceLocation;

export const isClusterContextLocation = (location: ObjectLocation): location is ClusterContextLocation =>
  location.type === CLUSTER_CONTEXT_LOCATION_TYPE;

export const isClusterResourceLocation = (location: ObjectLocation): location is ClusterResourceLocation =>
  location.type === CLUSTER_RESOURCE_LOCATION_TYPE;

export const isCommandLocation = (location: ObjectLocation): location is CommandLocation =>
  location.type === COMMAND_LOCATION_TYPE;

export const isHelmChartLocation = (location: ObjectLocation): location is HelmChartLocation =>
  location.type === HELM_CHART_LOCATION_TYPE;

export const isHelmPreviewResourceLocation = (location: ObjectLocation): location is HelmPreviewResourceLocation =>
  location.type === HELM_PREVIEW_RESOURCE_LOCATION_TYPE;

export const isHelmPreviewConfigurationLocation = (
  location: ObjectLocation
): location is HelmPreviewConfigurationLocation => location.type === HELM_PREVIEW_CONFIGURATION_LOCATION_TYPE;

export const isHelmValuesFileLocation = (location: ObjectLocation): location is HelmValuesFileLocation =>
  location.type === HELM_VALUES_FILE_LOCATION_TYPE;

export const isImageLocation = (location: ObjectLocation): location is ImageLocation =>
  location.type === IMAGE_LOCATION_TYPE;

export const isKustomizeKustomizationLocation = (
  location: ObjectLocation
): location is KustomizeKustomizationLocation => location.type === KUSTOMIZE_KUSTOMIZATION_LOCATION_TYPE;

export const isKustomizePreviewResourceLocation = (
  location: ObjectLocation
): location is KustomizePreviewResourceLocation => location.type === KUSTOMIZE_PREVIEW_RESOURCE_LOCATION_TYPE;

export const isLocalFileLocation = (location: ObjectLocation): location is LocalFileLocation =>
  location.type === LOCAL_FILE_LOCATION_TYPE;

export const isLocalResourceLocation = (location: ObjectLocation): location is LocalResourceLocation =>
  location.type === LOCAL_RESOURCE_LOCATION_TYPE;

export const isResourceLocation = (location: ObjectLocation): location is ResourceLocation =>
  isClusterResourceLocation(location) ||
  isHelmPreviewResourceLocation(location) ||
  isKustomizePreviewResourceLocation(location) ||
  isLocalResourceLocation(location);

export const isFileLocation = (location: ObjectLocation): location is FileLocation =>
  isHelmValuesFileLocation(location) || isLocalFileLocation(location);

export const isPreviewResourceLocation = (location: ObjectLocation): location is PreviewResourceLocation =>
  isHelmPreviewResourceLocation(location) || isKustomizePreviewResourceLocation(location);
