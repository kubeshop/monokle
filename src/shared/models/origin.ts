import * as Rt from 'runtypes';

const LocalOriginRuntype = Rt.Record({
  location: Rt.Literal('local'),
  filePath: Rt.String,
});

const ClusterOriginRuntype = Rt.Record({
  location: Rt.Literal('cluster'),
  context: Rt.String,
});

const HelmOriginRuntype = Rt.Record({
  location: Rt.Literal('helm'),
  chartId: Rt.String,
  valuesFilePath: Rt.String,
});

const KustomizeOriginRuntype = Rt.Record({
  location: Rt.Literal('kustomize'),
  kustomizationId: Rt.String,
});

export const ResourceOriginRuntype = Rt.Union(
  LocalOriginRuntype,
  ClusterOriginRuntype,
  HelmOriginRuntype,
  KustomizeOriginRuntype
);

export type LocalOrigin = Rt.Static<typeof LocalOriginRuntype>;
export type ClusterOrigin = Rt.Static<typeof ClusterOriginRuntype>;
export type HelmOrigin = Rt.Static<typeof HelmOriginRuntype>;
export type KustomizeOrigin = Rt.Static<typeof KustomizeOriginRuntype>;
export type ResourceOrigin = Rt.Static<typeof ResourceOriginRuntype>;

export const isLocalOrigin = LocalOriginRuntype.guard;
export const isClusterOrigin = ClusterOriginRuntype.guard;
export const isHelmOrigin = HelmOriginRuntype.guard;
export const isKustomizeOrigin = KustomizeOriginRuntype.guard;
export const isResourceOrigin = ResourceOriginRuntype.guard;
