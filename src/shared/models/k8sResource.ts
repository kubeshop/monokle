import {ResourceRef} from '@monokle/validation';

import {K8sObject} from './k8s';
import {ClusterOrigin, LocalOrigin, PreviewOrigin, TransientOrigin} from './origin';

export const RESOURCE_STORAGE = ['local', 'cluster', 'preview', 'transient'] as const;

// export type ResourceStorage = 'local' | 'cluster' | 'preview' | 'transient';
export type ResourceStorage = typeof RESOURCE_STORAGE[number];

export type ResourceIdentifier<Storage extends ResourceStorage = ResourceStorage> = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  storage: Storage;
  // origin: Origin;
};

export type ResourceRange = {
  start: number;
  length: number;
};

export interface ResourceMeta<Storage extends ResourceStorage = ResourceStorage> extends ResourceIdentifier<Storage> {
  origin: Storage extends 'local'
    ? LocalOrigin
    : Storage extends 'cluster'
    ? ClusterOrigin
    : Storage extends 'preview'
    ? PreviewOrigin
    : Storage extends 'transient'
    ? TransientOrigin
    : never;
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
  /** spec.metadata.labels */
  labels?: Record<string, string>;
  /** spec.metadata.labels.annotations  */
  annotations?: Record<string, string>;
  /** spec.template.metadata.labels */
  templateLabels?: Record<string, string>;
  /** if a resource is cluster scoped ( kind is namespaced ) */
  isClusterScoped: boolean;
  /** specifies the range in the file's content, applies only to file locations  */
  range?: ResourceRange;
  refs?: ResourceRef[];
}

export interface ResourceContent<Storage extends ResourceStorage = ResourceStorage>
  extends ResourceIdentifier<Storage> {
  text: string;
  object: K8sObject;
}
export type K8sResource<Storage extends ResourceStorage = ResourceStorage> = ResourceMeta<Storage> &
  ResourceContent<Storage>;

export type ResourceMetaMap<Storage extends ResourceStorage = ResourceStorage> = Record<string, ResourceMeta<Storage>>;

export type ResourceContentMap<Storage extends ResourceStorage = ResourceStorage> = Record<
  string,
  ResourceContent<Storage>
>;

export type ResourceMap<Storage extends ResourceStorage = ResourceStorage> = Record<string, K8sResource<Storage>>;

export type ResourceMetaMapByStorage = {
  [storage in ResourceStorage]: ResourceMetaMap<storage>;
};

export type ResourceContentMapByStorage = {
  [storage in ResourceStorage]: ResourceContentMap<storage>;
};

export type OriginFromStorage<T extends ResourceStorage> = T extends 'local'
  ? LocalOrigin
  : T extends 'cluster'
  ? ClusterOrigin
  : T extends 'preview'
  ? PreviewOrigin
  : T extends 'transient'
  ? TransientOrigin
  : never;

export const isResourceIdentifier = (value: any): value is ResourceIdentifier => {
  return (
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.storage === 'string' &&
    RESOURCE_STORAGE.includes(value.storage)
  );
};

export const isLocalResourceMeta = (value: ResourceMeta): value is ResourceMeta<'local'> => {
  return value.storage === 'local';
};

export const isClusterResourceMeta = (value: ResourceMeta): value is ResourceMeta<'cluster'> => {
  return value.storage === 'cluster';
};

export const isPreviewResourceMeta = (value: ResourceMeta): value is ResourceMeta<'preview'> => {
  return value.storage === 'preview';
};

export const isTransientResourceMeta = (value: ResourceMeta): value is ResourceMeta<'transient'> => {
  return value.storage === 'transient';
};

export const isLocalResourceContent = (value: ResourceContent): value is ResourceContent<'local'> => {
  return value.storage === 'local';
};

export const isClusterResourceContent = (value: ResourceContent): value is ResourceContent<'cluster'> => {
  return value.storage === 'cluster';
};

export const isPreviewResourceContent = (value: ResourceContent): value is ResourceContent<'preview'> => {
  return value.storage === 'preview';
};

export const isTransientResourceContent = (value: ResourceContent): value is ResourceContent<'transient'> => {
  return value.storage === 'transient';
};

export const isLocalResource = (value: K8sResource): value is K8sResource<'local'> => {
  return value.storage === 'local';
};

export const isClusterResource = (value: K8sResource): value is K8sResource<'cluster'> => {
  return value.storage === 'cluster';
};

export const isPreviewResource = (value: K8sResource): value is K8sResource<'preview'> => {
  return value.storage === 'preview';
};

export const isTransientResource = (value: K8sResource): value is K8sResource<'transient'> => {
  return value.storage === 'transient';
};
