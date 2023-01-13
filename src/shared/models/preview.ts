import * as Rt from 'runtypes';

const HelmPreviewRuntype = Rt.Record({
  type: Rt.Literal('helm'),
  valuesFilePath: Rt.String,
  helmChartId: Rt.String,
});

const HelmConfigurationPreviewRuntype = Rt.Record({
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
  HelmConfigurationPreviewRuntype,
  KustomizePreviewRuntype,
  CommandPreviewRuntype
);

export type HelmPreview = Rt.Static<typeof HelmPreviewRuntype>;
export type HelmConfigurationPreview = Rt.Static<typeof HelmConfigurationPreviewRuntype>;
export type KustomizePreview = Rt.Static<typeof KustomizePreviewRuntype>;
export type CommandPreview = Rt.Static<typeof CommandPreviewRuntype>;
export type AnyPreview = Rt.Static<typeof AnyPreviewRuntype>;

export const isHelmPreview = HelmPreviewRuntype.guard;
export const isHelmConfigurationPreview = HelmConfigurationPreviewRuntype.guard;
export const isKustomizePreview = KustomizePreviewRuntype.guard;
export const isCommandPreview = CommandPreviewRuntype.guard;
export const isAnyPreview = AnyPreviewRuntype.guard;

export type PreviewState = {
  current?: AnyPreview;
  isLoading?: boolean;
};