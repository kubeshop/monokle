import {KubernetesObject} from './appState';
import {ClusterOrigin, HelmOrigin, KustomizeOrigin, LocalOrigin, ResourceOrigin} from './origin';

export type ResourceMeta = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  origin: ResourceOrigin;
  /**
   * name - generated from manifest metadata
   */
  name: string;
  /** k8s resource kind */
  kind: string;
  /** k8s resource apiVersion value */
  apiVersion: string;
  /** k8s namespace is specified (for filtering) */
  namespace?: string;
  /** if a resource is cluster scoped ( kind is namespaced ) */
  isClusterScoped: boolean;
  /** specifies the range in the file's content, applies only to file locations  */
  range?: {
    start: number;
    length: number;
  };
  isUnsaved?: boolean;
};

export type LocalResourceMeta = ResourceMeta & {origin: LocalOrigin};
export type ClusterResourceMeta = ResourceMeta & {origin: ClusterOrigin};
export type HelmResourceMeta = ResourceMeta & {origin: HelmOrigin};
export type KustomizeResourceMeta = ResourceMeta & {origin: KustomizeOrigin};

export type ResourceContent = {
  id: string;
  origin: ResourceOrigin;
  text: string;
  object: KubernetesObject;
};

export type LocalResourceContent = ResourceContent & {origin: LocalOrigin};
export type ClusterResourceContent = ResourceContent & {origin: ClusterOrigin};
export type HelmResourceContent = ResourceContent & {origin: HelmOrigin};
export type KustomizeResourceContent = ResourceContent & {origin: KustomizeOrigin};

export type K8sResource = ResourceMeta & ResourceContent;
export type LocalK8sResource = K8sResource & {origin: LocalOrigin};
export type ClusterK8sResource = K8sResource & {origin: ClusterOrigin};
export type HelmK8sResource = K8sResource & {origin: HelmOrigin};
export type KustomizeK8sResource = K8sResource & {origin: KustomizeOrigin};

export type ResourceMetaMap = Record<string, ResourceMeta>;
export type LocalResourceMetaMap = Record<string, LocalResourceMeta>;
export type ClusterResourceMetaMap = Record<string, ClusterResourceMeta>;
export type HelmResourceMetaMap = Record<string, HelmResourceMeta>;
export type KustomizeResourceMetaMap = Record<string, KustomizeResourceMeta>;

export type ResourceContentMap = Record<string, ResourceContent>;
export type LocalResourceContentMap = Record<string, LocalResourceContent>;
export type ClusterResourceContentMap = Record<string, ClusterResourceContent>;
export type HelmResourceContentMap = Record<string, HelmResourceContent>;
export type KustomizeResourceContentMap = Record<string, KustomizeResourceContent>;

export type ResourceMapType = Record<string, K8sResource>;
