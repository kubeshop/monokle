import * as Rt from 'runtypes';

/*
 * Types
 */

export type LocalOrigin = {
  type: 'local';
  filePath: string;
};
export type ClusterOrigin = {
  type: 'cluster';
  context: string;
};
export type HelmOrigin =
  | {
      type: 'helm';
      chartId: string;
      valuesFilePath: string;
    }
  | {
      type: 'helm';
      previewConfigurationId: string;
    };
export type KustomizeOrigin = {
  type: 'kustomize';
  kustomizationId: string;
};
export type CommandOrigin = {
  type: 'command';
  commandId: string;
};
export type PreviewOrigin = HelmOrigin | KustomizeOrigin | CommandOrigin;
export type AnyOrigin = LocalOrigin | ClusterOrigin | PreviewOrigin;

/*
 * Runtypes
 */

export const LocalOriginRuntype: Rt.Runtype<LocalOrigin> = Rt.Record({
  type: Rt.Literal('local'),
  filePath: Rt.String,
});
export const ClusterOriginRuntype: Rt.Runtype<ClusterOrigin> = Rt.Record({
  type: Rt.Literal('cluster'),
  context: Rt.String,
});
export const HelmOriginRuntype: Rt.Runtype<HelmOrigin> = Rt.Union(
  Rt.Record({
    type: Rt.Literal('helm'),
    chartId: Rt.String,
    valuesFilePath: Rt.String,
  }),
  Rt.Record({
    type: Rt.Literal('helm'),
    previewConfigurationId: Rt.String,
  })
);
export const KustomizeOriginRuntype: Rt.Runtype<KustomizeOrigin> = Rt.Record({
  type: Rt.Literal('kustomize'),
  kustomizationId: Rt.String,
});
export const CommandOriginRuntype: Rt.Runtype<CommandOrigin> = Rt.Record({
  type: Rt.Literal('command'),
  commandId: Rt.String,
});
const PreviewOriginRuntype: Rt.Runtype<PreviewOrigin> = Rt.Union(
  HelmOriginRuntype,
  KustomizeOriginRuntype,
  CommandOriginRuntype
);
export const AnyOriginRuntype: Rt.Runtype<AnyOrigin> = Rt.Union(
  LocalOriginRuntype,
  ClusterOriginRuntype,
  HelmOriginRuntype,
  KustomizeOriginRuntype
);

/*
 * Type guards
 */

export const isLocalOrigin = LocalOriginRuntype.guard;
export const isClusterOrigin = ClusterOriginRuntype.guard;
export const isHelmOrigin = HelmOriginRuntype.guard;
export const isKustomizeOrigin = KustomizeOriginRuntype.guard;
export const isPreviewCommandOrigin = CommandOriginRuntype.guard;
export const isPreviewOrigin = PreviewOriginRuntype.guard;
export const isAnyOrigin = AnyOriginRuntype.guard;
