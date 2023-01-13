import * as Rt from 'runtypes';

import {K8sObject, K8sObjectRuntype} from './k8s';
import {
  AnyOrigin,
  AnyOriginRuntype,
  ClusterOrigin,
  ClusterOriginRuntype,
  LocalOrigin,
  LocalOriginRuntype,
  PreviewOriginRuntype,
} from './origin';

export type ResourceIdentifier<Origin extends AnyOrigin = AnyOrigin> = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  origin: Origin;
};

const ResourceIdentifierRuntype: Rt.Runtype<ResourceIdentifier<AnyOrigin>> = Rt.Record({
  id: Rt.String,
  origin: AnyOriginRuntype,
});

export const isResourceIdentifier = ResourceIdentifierRuntype.guard;

export interface ResourceMeta<Origin extends AnyOrigin = AnyOrigin> extends ResourceIdentifier<Origin> {
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
}

const ResourceMetaRuntype: Rt.Runtype<ResourceMeta<AnyOrigin>> = Rt.Record({
  id: Rt.String,
  origin: AnyOriginRuntype,
  name: Rt.String,
  kind: Rt.String,
  apiVersion: Rt.String,
  namespace: Rt.Optional(Rt.String),
  isClusterScoped: Rt.Boolean,
  range: Rt.Optional(
    Rt.Record({
      start: Rt.Number,
      length: Rt.Number,
    })
  ),
  isUnsaved: Rt.Optional(Rt.Boolean),
});

const LocalResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: LocalOriginRuntype}));
const ClusterResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: ClusterOriginRuntype}));
const PreviewResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: PreviewOriginRuntype}));

export const isLocalResourceMeta = LocalResourceMetaRuntype.guard;
export const isClusterResourceMeta = ClusterResourceMetaRuntype.guard;
export const isPreviewResourceMeta = PreviewResourceMetaRuntype.guard;

export interface ResourceContent<Origin extends AnyOrigin = AnyOrigin> extends ResourceIdentifier<Origin> {
  text: string;
  object: K8sObject;
}

const ResourceContentRuntype: Rt.Runtype<ResourceContent<AnyOrigin>> = Rt.Record({
  id: Rt.String,
  origin: AnyOriginRuntype,
  text: Rt.String,
  object: K8sObjectRuntype,
});

const LocalResourceContentRuntype: Rt.Runtype<ResourceContent<LocalOrigin>> = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({origin: LocalOriginRuntype})
);
const ClusterResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: ClusterOriginRuntype}));
const PreviewResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: PreviewOriginRuntype}));

export const isLocalResourceContent = LocalResourceContentRuntype.guard;
export const isClusterResourceContent = ClusterResourceContentRuntype.guard;
export const isPreviewResourceContent = PreviewResourceContentRuntype.guard;

export type K8sResource<Origin extends AnyOrigin = AnyOrigin> = ResourceMeta<Origin> & ResourceContent<Origin>;

const ResourceRuntype: Rt.Runtype<K8sResource> = Rt.Intersect(ResourceMetaRuntype, ResourceContentRuntype);
const LocalResourceRuntype: Rt.Runtype<K8sResource<LocalOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: LocalOriginRuntype})
);
const ClusterResourceRuntype: Rt.Runtype<K8sResource<ClusterOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: ClusterOriginRuntype})
);
const PreviewResourceRuntype: Rt.Runtype<K8sResource> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: PreviewOriginRuntype})
);

export const isResource = ResourceRuntype.guard;
export const isLocalResource = LocalResourceRuntype.guard;
export const isClusterResource = ClusterResourceRuntype.guard;
export const isPreviewResource = PreviewResourceRuntype.guard;

export type ResourceMetaMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, ResourceMeta<Origin>>;

export type ResourceContentMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, ResourceContent<Origin>>;

export type ResourceMapType = Record<string, K8sResource>;

export type ResourceStorage = 'local' | 'cluster' | 'preview';