import * as Rt from 'runtypes';

export type HelmPreview = {
  type: 'helm';
  valuesFileId: string;
  chartId: string;
};

export type HelmConfigPreview = {
  type: 'helm-config';
  configId: string;
};

export type KustomizePreview = {
  type: 'kustomize';
  kustomizationId: string;
};

export type CommandPreview = {
  type: 'command';
  commandId: string;
};

export type AnyPreview = HelmPreview | HelmConfigPreview | KustomizePreview | CommandPreview;

const HelmPreviewRuntype: Rt.Runtype<HelmPreview> = Rt.Record({
  type: Rt.Literal('helm'),
  valuesFileId: Rt.String,
  chartId: Rt.String,
});

const HelmConfigPreviewRuntype: Rt.Runtype<HelmConfigPreview> = Rt.Record({
  type: Rt.Literal('helm-config'),
  configId: Rt.String,
});

const KustomizePreviewRuntype: Rt.Runtype<KustomizePreview> = Rt.Record({
  type: Rt.Literal('kustomize'),
  kustomizationId: Rt.String,
});

const CommandPreviewRuntype: Rt.Runtype<CommandPreview> = Rt.Record({
  type: Rt.Literal('command'),
  commandId: Rt.String,
});

export const AnyPreviewRuntype: Rt.Runtype<AnyPreview> = Rt.Union(
  HelmPreviewRuntype,
  HelmConfigPreviewRuntype,
  KustomizePreviewRuntype,
  CommandPreviewRuntype
);

// export type HelmPreview = Rt.Static<typeof HelmPreviewRuntype>;
// export type HelmConfigPreview = Rt.Static<typeof HelmConfigPreviewRuntype>;
// export type KustomizePreview = Rt.Static<typeof KustomizePreviewRuntype>;
// export type CommandPreview = Rt.Static<typeof CommandPreviewRuntype>;
// export type AnyPreview = Rt.Static<typeof AnyPreviewRuntype>;

export type PreviewType = AnyPreview['type'];

export const isHelmPreview = HelmPreviewRuntype.guard;
export const isHelmConfigPreview = HelmConfigPreviewRuntype.guard;
export const isKustomizePreview = KustomizePreviewRuntype.guard;
export const isCommandPreview = CommandPreviewRuntype.guard;
export const isAnyPreview = AnyPreviewRuntype.guard;
