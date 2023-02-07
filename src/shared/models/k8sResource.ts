import * as Rt from 'runtypes';

import {ResourceRef} from '@monokle/validation';

import {K8sObject, K8sObjectRuntype} from './k8s';
import {
  AnyOriginRuntype,
  ClusterOrigin,
  ClusterOriginRuntype,
  LocalOrigin,
  LocalOriginRuntype,
  PreviewOrigin,
  PreviewOriginRuntype,
  TransientOrigin,
  TransientOriginRuntype,
} from './origin';

export type ResourceStorage = 'local' | 'cluster' | 'preview' | 'transient';

const ResourceStorageRuntype = Rt.Union(
  Rt.Literal('local'),
  Rt.Literal('cluster'),
  Rt.Literal('preview'),
  Rt.Literal('transient')
);

export type ResourceIdentifier<Storage extends ResourceStorage = ResourceStorage> = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  storage: Storage;
  // origin: Origin;
};

export const ResourceIdentifierRuntype: Rt.Runtype<ResourceIdentifier<ResourceStorage>> = Rt.Record({
  id: Rt.String,
  storage: ResourceStorageRuntype,
  // origin: AnyOriginRuntype,
});

export const isResourceIdentifier = ResourceIdentifierRuntype.guard;

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
  range?: {
    start: number;
    length: number;
  };
  refs?: ResourceRef[];
}

const ResourceMetaRuntype: Rt.Runtype<ResourceMeta<ResourceStorage>> = Rt.Record({
  id: Rt.String,
  storage: ResourceStorageRuntype,
  origin: AnyOriginRuntype,
  name: Rt.String,
  kind: Rt.String,
  apiVersion: Rt.String,
  namespace: Rt.Optional(Rt.String),
  labels: Rt.Optional(Rt.Dictionary(Rt.String)),
  annotations: Rt.Optional(Rt.Dictionary(Rt.String)),
  templateLabels: Rt.Optional(Rt.Dictionary(Rt.String)),
  isClusterScoped: Rt.Boolean,
  range: Rt.Optional(
    Rt.Record({
      start: Rt.Number,
      length: Rt.Number,
    })
  ),
  isTransient: Rt.Optional(Rt.Boolean),
});

const LocalResourceMetaRuntype: Rt.Runtype<ResourceMeta<'local'>> = Rt.Intersect(
  ResourceMetaRuntype,
  Rt.Record({storage: Rt.Literal('local'), origin: LocalOriginRuntype})
);
const ClusterResourceMetaRuntype: Rt.Runtype<ResourceMeta<'cluster'>> = Rt.Intersect(
  ResourceMetaRuntype,
  Rt.Record({storage: Rt.Literal('cluster'), origin: ClusterOriginRuntype})
);
const PreviewResourceMetaRuntype: Rt.Runtype<ResourceMeta<'preview'>> = Rt.Intersect(
  ResourceMetaRuntype,
  Rt.Record({storage: Rt.Literal('preview'), origin: PreviewOriginRuntype})
);
const TransientResourceMetaRuntype: Rt.Runtype<ResourceMeta<'transient'>> = Rt.Intersect(
  ResourceMetaRuntype,
  Rt.Record({storage: Rt.Literal('transient'), origin: TransientOriginRuntype})
);

export const isLocalResourceMeta = LocalResourceMetaRuntype.guard;
export const isClusterResourceMeta = ClusterResourceMetaRuntype.guard;
export const isPreviewResourceMeta = PreviewResourceMetaRuntype.guard;
export const isTransientResourceMeta = TransientResourceMetaRuntype.guard;

export interface ResourceContent<Storage extends ResourceStorage = ResourceStorage>
  extends ResourceIdentifier<Storage> {
  text: string;
  object: K8sObject;
}

const ResourceContentRuntype: Rt.Runtype<ResourceContent<ResourceStorage>> = Rt.Record({
  id: Rt.String,
  storage: ResourceStorageRuntype,
  origin: AnyOriginRuntype,
  text: Rt.String,
  object: K8sObjectRuntype,
});

const LocalResourceContentRuntype: Rt.Runtype<ResourceContent<'local'>> = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({storage: Rt.Literal('local'), origin: LocalOriginRuntype})
);
const ClusterResourceContentRuntype: Rt.Runtype<ResourceContent<'cluster'>> = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({storage: Rt.Literal('cluster'), origin: ClusterOriginRuntype})
);
const PreviewResourceContentRuntype: Rt.Runtype<ResourceContent<'preview'>> = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({storage: Rt.Literal('preview'), origin: PreviewOriginRuntype})
);
const TransientResourceContentRuntype: Rt.Runtype<ResourceContent<'transient'>> = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({storage: Rt.Literal('transient'), origin: TransientOriginRuntype})
);

export const isLocalResourceContent = LocalResourceContentRuntype.guard;
export const isClusterResourceContent = ClusterResourceContentRuntype.guard;
export const isPreviewResourceContent = PreviewResourceContentRuntype.guard;
export const isTransientResourceContent = TransientResourceContentRuntype.guard;

export type K8sResource<Storage extends ResourceStorage = ResourceStorage> = ResourceMeta<Storage> &
  ResourceContent<Storage>;

const ResourceRuntype: Rt.Runtype<K8sResource> = Rt.Intersect(ResourceMetaRuntype, ResourceContentRuntype);
const LocalResourceRuntype: Rt.Runtype<K8sResource<'local'>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({storage: Rt.Literal('local'), origin: LocalOriginRuntype})
);
const ClusterResourceRuntype: Rt.Runtype<K8sResource<'cluster'>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({storage: Rt.Literal('cluster'), origin: ClusterOriginRuntype})
);
const PreviewResourceRuntype: Rt.Runtype<K8sResource<'preview'>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({storage: Rt.Literal('preview'), origin: PreviewOriginRuntype})
);
const TransientResourceRuntype: Rt.Runtype<K8sResource<'transient'>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({storage: Rt.Literal('transient'), origin: TransientOriginRuntype})
);

export const isResource = ResourceRuntype.guard;
export const isLocalResource = (resource: ResourceMeta): resource is K8sResource<'local'> =>
  resource.storage === 'local'; // || LocalResourceRuntype.guard;
export const isClusterResource = ClusterResourceRuntype.guard;
export const isPreviewResource = PreviewResourceRuntype.guard;
export const isTransientResource = TransientResourceRuntype.guard;

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
