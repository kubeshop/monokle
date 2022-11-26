import * as Rt from 'runtypes';

export type LocalOrigin = {
  type: 'local';
  filePath: string;
};

export const LocalOriginRuntype: Rt.Runtype<LocalOrigin> = Rt.Record({
  type: Rt.Literal('local'),
  filePath: Rt.String,
});

export type ClusterOrigin = {
  type: 'cluster';
  context: string;
};

export const ClusterOriginRuntype: Rt.Runtype<ClusterOrigin> = Rt.Record({
  type: Rt.Literal('cluster'),
  context: Rt.String,
});

export type HelmOrigin = {
  type: 'helm';
  chartId: string;
  valuesFilePath: string;
};

export const HelmOriginRuntype: Rt.Runtype<HelmOrigin> = Rt.Record({
  type: Rt.Literal('helm'),
  chartId: Rt.String,
  valuesFilePath: Rt.String,
});

export type KustomizeOrigin = {
  type: 'kustomize';
  kustomizationId: string;
};

export const KustomizeOriginRuntype: Rt.Runtype<KustomizeOrigin> = Rt.Record({
  type: Rt.Literal('kustomize'),
  kustomizationId: Rt.String,
});

export type ResourceOrigin = LocalOrigin | ClusterOrigin | HelmOrigin | KustomizeOrigin;

export const ResourceOriginRuntype: Rt.Runtype<ResourceOrigin> = Rt.Union(
  LocalOriginRuntype,
  ClusterOriginRuntype,
  HelmOriginRuntype,
  KustomizeOriginRuntype
);

export const isLocalOrigin = LocalOriginRuntype.guard;
export const isClusterOrigin = ClusterOriginRuntype.guard;
export const isHelmOrigin = HelmOriginRuntype.guard;
export const isKustomizeOrigin = KustomizeOriginRuntype.guard;
export const isResourceOrigin = ResourceOriginRuntype.guard;
