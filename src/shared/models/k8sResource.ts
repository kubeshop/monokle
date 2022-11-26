import * as Rt from 'runtypes';

import {K8sObject, K8sObjectRuntype} from './k8s';
import {
  ClusterOrigin,
  ClusterOriginRuntype,
  HelmOrigin,
  HelmOriginRuntype,
  KustomizeOrigin,
  KustomizeOriginRuntype,
  LocalOrigin,
  LocalOriginRuntype,
  ResourceOrigin,
  ResourceOriginRuntype,
} from './origin';

export type ResourceMeta<OriginType extends ResourceOrigin = ResourceOrigin> = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  origin: OriginType;
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

export type LocalResourceMeta = ResourceMeta<LocalOrigin>;
export type ClusterResourceMeta = ResourceMeta<ClusterOrigin>;
export type HelmResourceMeta = ResourceMeta<HelmOrigin>;
export type KustomizeResourceMeta = ResourceMeta<KustomizeOrigin>;

const ResourceMetaRuntype: Rt.Runtype<ResourceMeta<ResourceOrigin>> = Rt.Record({
  id: Rt.String,
  origin: ResourceOriginRuntype,
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
const HelmResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: HelmOriginRuntype}));
const KustomizeResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: KustomizeOriginRuntype}));

export const isLocalResourceMeta = LocalResourceMetaRuntype.guard;
export const isClusterResourceMeta = ClusterResourceMetaRuntype.guard;
export const isHelmResourceMeta = HelmResourceMetaRuntype.guard;
export const isKustomizeResourceMeta = KustomizeResourceMetaRuntype.guard;

export type ResourceContent<Origin extends ResourceOrigin = ResourceOrigin> = {
  id: string;
  origin: Origin;
  text: string;
  object: K8sObject;
};

export type LocalResourceContent = ResourceContent<LocalOrigin>;
export type ClusterResourceContent = ResourceContent<ClusterOrigin>;
export type HelmResourceContent = ResourceContent<HelmOrigin>;
export type KustomizeResourceContent = ResourceContent<KustomizeOrigin>;

const ResourceContentRuntype: Rt.Runtype<ResourceContent<ResourceOrigin>> = Rt.Record({
  id: Rt.String,
  origin: ResourceOriginRuntype,
  text: Rt.String,
  object: K8sObjectRuntype,
});

const LocalResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: LocalOriginRuntype}));
const ClusterResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: ClusterOriginRuntype}));
const HelmResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: HelmOriginRuntype}));
const KustomizeResourceContentRuntype = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({origin: KustomizeOriginRuntype})
);

export const isLocalResourceContent = LocalResourceContentRuntype.guard;
export const isClusterResourceContent = ClusterResourceContentRuntype.guard;
export const isHelmResourceContent = HelmResourceContentRuntype.guard;
export const isKustomizeResourceContent = KustomizeResourceContentRuntype.guard;

export type K8sResource<Origin extends ResourceOrigin = ResourceOrigin> = ResourceMeta<Origin> &
  ResourceContent<Origin>;
export type LocalK8sResource = K8sResource<LocalOrigin>;
export type ClusterK8sResource = K8sResource<ClusterOrigin>;
export type HelmK8sResource = K8sResource<HelmOrigin>;
export type KustomizeK8sResource = K8sResource<KustomizeOrigin>;

const K8sResourceRuntype: Rt.Runtype<K8sResource> = Rt.Intersect(ResourceMetaRuntype, ResourceContentRuntype);
const LocalK8sResourceRuntype: Rt.Runtype<LocalK8sResource> = Rt.Intersect(
  K8sResourceRuntype,
  Rt.Record({origin: LocalOriginRuntype})
);
const ClusterK8sResourceRuntype: Rt.Runtype<ClusterK8sResource> = Rt.Intersect(
  K8sResourceRuntype,
  Rt.Record({origin: ClusterOriginRuntype})
);
const HelmK8sResourceRuntype: Rt.Runtype<HelmK8sResource> = Rt.Intersect(
  K8sResourceRuntype,
  Rt.Record({origin: HelmOriginRuntype})
);
const KustomizeK8sResourceRuntype: Rt.Runtype<KustomizeK8sResource> = Rt.Intersect(
  K8sResourceRuntype,
  Rt.Record({origin: KustomizeOriginRuntype})
);

export const isK8sResource = K8sResourceRuntype.guard;
export const isLocalK8sResource = LocalK8sResourceRuntype.guard;
export const isClusterK8sResource = ClusterK8sResourceRuntype.guard;
export const isHelmK8sResource = HelmK8sResourceRuntype.guard;
export const isKustomizeK8sResource = KustomizeK8sResourceRuntype.guard;

export type ResourceMetaMap = Record<string, ResourceMeta<ResourceOrigin>>;
export type LocalResourceMetaMap = Record<string, LocalResourceMeta>;
export type ClusterResourceMetaMap = Record<string, ClusterResourceMeta>;
export type HelmResourceMetaMap = Record<string, HelmResourceMeta>;
export type KustomizeResourceMetaMap = Record<string, KustomizeResourceMeta>;

export type ResourceContentMap = Record<string, ResourceContent<ResourceOrigin>>;
export type LocalResourceContentMap = Record<string, LocalResourceContent>;
export type ClusterResourceContentMap = Record<string, ClusterResourceContent>;
export type HelmResourceContentMap = Record<string, HelmResourceContent>;
export type KustomizeResourceContentMap = Record<string, KustomizeResourceContent>;

export type ResourceMapType = Record<string, K8sResource>;
