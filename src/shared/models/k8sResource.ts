import {ResourceRef, isResourceRef} from '@monokle/validation';

import {K8sObject} from './k8s';
import {
  AnyOrigin,
  ClusterOrigin,
  LocalOrigin,
  PreviewOrigin,
  TransientOrigin,
  isClusterOrigin,
  isLocalOrigin,
  isPreviewOrigin,
  isTransientOrigin,
} from './origin';

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

export const isResourceRange = (value: any): value is ResourceRange => {
  return (
    typeof value === 'object' &&
    'start' in value &&
    typeof value.start === 'number' &&
    'number' in value &&
    typeof value.length === 'number'
  );
};

const createIsResourceMeta =
  <Storage extends ResourceStorage, Origin extends AnyOrigin>(storage: Storage, isOrigin: (x: any) => x is Origin) =>
  (value: any): value is ResourceMeta<Storage> => {
    return (
      typeof value === 'object' &&
      'storage' in value &&
      value.storage === storage &&
      'origin' in value &&
      isOrigin(value.origin) &&
      'name' in value &&
      typeof value.name === 'string' &&
      'kind' in value &&
      typeof value.kind === 'string' &&
      'apiVersion' in value &&
      typeof value.apiVersion === 'string' &&
      'isClusterScoped' in value &&
      typeof value.isClusterScoped === 'boolean' &&
      ('namespace' in value ? typeof value.namespace === 'string' : true) &&
      ('labels' in value ? typeof value.labels === 'object' : true) &&
      ('annotations' in value ? typeof value.annotations === 'object' : true) &&
      ('templateLabels' in value ? typeof value.templateLabels === 'object' : true) &&
      ('range' in value ? typeof value.range === 'object' : true) && // TODO: isResourceRange
      ('refs' in value ? Array.isArray(value.refs) && value.refs.every(isResourceRef) : true)
    );
  };

export const isLocalResourceMeta = createIsResourceMeta('local', isLocalOrigin);
export const isClusterResourceMeta = createIsResourceMeta('cluster', isClusterOrigin);
export const isPreviewResourceMeta = createIsResourceMeta('preview', isPreviewOrigin);
export const isTransientResourceMeta = createIsResourceMeta('transient', isTransientOrigin);

const createIsResourceContent =
  <Storage extends ResourceStorage>(storage: Storage) =>
  (value: any): value is ResourceContent => {
    return (
      typeof value === 'object' &&
      'storage' in value &&
      value.storage === storage &&
      'text' in value &&
      typeof value.text === 'string' &&
      'object' in value &&
      typeof value.object === 'object'
    );
  };

export const isLocalResourceContent = createIsResourceContent('local');
export const isClusterResourceContent = createIsResourceContent('cluster');
export const isPreviewResourceContent = createIsResourceContent('preview');
export const isTransientResourceContent = createIsResourceContent('transient');

export const isLocalResource = (value: any): value is K8sResource<'local'> => {
  return isLocalResourceMeta(value) && isLocalResourceContent(value);
};

export const isClusterResource = (value: any): value is K8sResource<'cluster'> => {
  return isClusterResourceMeta(value) && isClusterResourceContent(value);
};

export const isPreviewResource = (value: any): value is K8sResource<'preview'> => {
  return isPreviewResourceMeta(value) && isPreviewResourceContent(value);
};

export const isTransientResource = (value: any): value is K8sResource<'transient'> => {
  return isTransientResourceMeta(value) && isTransientResourceContent(value);
};
