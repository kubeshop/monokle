import * as Rt from 'runtypes';

const HelmPreviewRuntype = Rt.Record({
  type: Rt.Literal('helm'),
  valuesFileId: Rt.String,
  chartId: Rt.String,
});

const HelmConfigPreviewRuntype = Rt.Record({
  type: Rt.Literal('helm-config'),
  configId: Rt.String,
});

const KustomizePreviewRuntype = Rt.Record({
  type: Rt.Literal('kustomize'),
  kustomizationId: Rt.String,
});

const CommandPreviewRuntype = Rt.Record({
  type: Rt.Literal('command'),
  commandId: Rt.String,
});

export const AnyPreviewRuntype = Rt.Union(
  HelmPreviewRuntype,
  HelmConfigPreviewRuntype,
  KustomizePreviewRuntype,
  CommandPreviewRuntype
);

export type HelmPreview = Rt.Static<typeof HelmPreviewRuntype>;
export type HelmConfigPreview = Rt.Static<typeof HelmConfigPreviewRuntype>;
export type KustomizePreview = Rt.Static<typeof KustomizePreviewRuntype>;
export type CommandPreview = Rt.Static<typeof CommandPreviewRuntype>;
export type AnyPreview = Rt.Static<typeof AnyPreviewRuntype>;

export const isHelmPreview = HelmPreviewRuntype.guard;
export const isHelmConfigPreview = HelmConfigPreviewRuntype.guard;
export const isKustomizePreview = KustomizePreviewRuntype.guard;
export const isCommandPreview = CommandPreviewRuntype.guard;
export const isAnyPreview = AnyPreviewRuntype.guard;
