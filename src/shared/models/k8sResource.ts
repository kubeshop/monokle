import {KubernetesObject} from './appState';
import {
  ClusterContextLocation,
  FileLocation,
  HelmChartLocation,
  KustomizeKustomizationLocation,
} from './objectLocation';

type ResourceSourceLocation =
  | FileLocation
  | ClusterContextLocation
  | HelmChartLocation
  | KustomizeKustomizationLocation;

type ResourceMeta = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  sourceLocation: ResourceSourceLocation;
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

type ResourceContent = {
  id: string;
  text: string;
  object: KubernetesObject;
};

type K8sResource = {
  meta: ResourceMeta;
  content: ResourceContent;
};

export type {K8sResource, ResourceSourceLocation, ResourceMeta, ResourceContent};
