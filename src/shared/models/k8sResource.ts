import * as Rt from 'runtypes';

import {K8sObject, K8sObjectRuntype} from './k8s';
import {
  AnyOrigin,
  AnyOriginRuntype,
  ClusterOrigin,
  ClusterOriginRuntype,
  CommandOrigin,
  CommandOriginRuntype,
  HelmOrigin,
  HelmOriginRuntype,
  KustomizeOrigin,
  KustomizeOriginRuntype,
  LocalOrigin,
  LocalOriginRuntype,
} from './origin';

export type ResourceMeta<Origin extends AnyOrigin = AnyOrigin> = {
  /** an internally generated UUID
   * - used for references/lookups in resourceMaps */
  id: string;
  origin: Origin;
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
const HelmResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: HelmOriginRuntype}));
const KustomizeResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: KustomizeOriginRuntype}));
const CommandResourceMetaRuntype = Rt.Intersect(ResourceMetaRuntype, Rt.Record({origin: CommandOriginRuntype}));

export const isLocalResourceMeta = LocalResourceMetaRuntype.guard;
export const isClusterResourceMeta = ClusterResourceMetaRuntype.guard;
export const isHelmResourceMeta = HelmResourceMetaRuntype.guard;
export const isKustomizeResourceMeta = KustomizeResourceMetaRuntype.guard;
export const isCommandResourceMeta = CommandResourceMetaRuntype.guard;

export type ResourceContent<Origin extends AnyOrigin = AnyOrigin> = {
  id: string;
  origin: Origin;
  text: string;
  object: K8sObject;
};

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
const HelmResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: HelmOriginRuntype}));
const KustomizeResourceContentRuntype = Rt.Intersect(
  ResourceContentRuntype,
  Rt.Record({origin: KustomizeOriginRuntype})
);
const CommandResourceContentRuntype = Rt.Intersect(ResourceContentRuntype, Rt.Record({origin: CommandOriginRuntype}));

export const isLocalResourceContent = LocalResourceContentRuntype.guard;
export const isClusterResourceContent = ClusterResourceContentRuntype.guard;
export const isHelmResourceContent = HelmResourceContentRuntype.guard;
export const isKustomizeResourceContent = KustomizeResourceContentRuntype.guard;
export const isCommandResourceContent = CommandResourceContentRuntype.guard;

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
const HelmResourceRuntype: Rt.Runtype<K8sResource<HelmOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: HelmOriginRuntype})
);
const KustomizeResourceRuntype: Rt.Runtype<K8sResource<KustomizeOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: KustomizeOriginRuntype})
);
const CommandResourceRuntype: Rt.Runtype<K8sResource<CommandOrigin>> = Rt.Intersect(
  ResourceRuntype,
  Rt.Record({origin: CommandOriginRuntype})
);

export const isResource = ResourceRuntype.guard;
export const isLocalResource = LocalResourceRuntype.guard;
export const isClusterResource = ClusterResourceRuntype.guard;
export const isHelmResource = HelmResourceRuntype.guard;
export const isKustomizeResource = KustomizeResourceRuntype.guard;
export const isCommandResource = CommandResourceRuntype.guard;

export type ResourceMetaMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, ResourceMeta<Origin>>;

export type ResourceContentMap<Origin extends AnyOrigin = AnyOrigin> = Record<string, ResourceContent<Origin>>;

export type ResourceMapType = Record<string, K8sResource>;
