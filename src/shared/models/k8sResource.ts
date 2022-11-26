import {KubernetesObject} from './appState';
import {ResourceOrigin} from './origin';

type ResourceMeta = {
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

type ResourceContent = {
  id: string;
  text: string;
  object: KubernetesObject;
};

type K8sResource = ResourceMeta & ResourceContent;

export type {K8sResource, ResourceMeta, ResourceContent};
