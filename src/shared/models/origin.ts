import * as Rt from 'runtypes';

import {AnyPreview, AnyPreviewRuntype} from './preview';

/*
 * Types
 */

export type LocalOrigin = {
  filePath: string;
  // fileOffset: number;
};
export type ClusterOrigin = {
  context: string;
};
export type PreviewOrigin<Preview extends AnyPreview = AnyPreview> = {
  preview: Preview;
};
export type TransientOrigin = {
  // TODO: createdFrom?: 'template' | 'cluster'; ? do we need this?
};

export type AnyOrigin = LocalOrigin | ClusterOrigin | PreviewOrigin | TransientOrigin;

/*
 * Runtypes
 */

export const LocalOriginRuntype: Rt.Runtype<LocalOrigin> = Rt.Record({
  storage: Rt.Literal('local'),
  filePath: Rt.String,
});
export const ClusterOriginRuntype: Rt.Runtype<ClusterOrigin> = Rt.Record({
  storage: Rt.Literal('cluster'),
  context: Rt.String,
});
export const PreviewOriginRuntype: Rt.Runtype<PreviewOrigin> = Rt.Record({
  storage: Rt.Literal('preview'),
  preview: AnyPreviewRuntype,
});
export const TransientOriginRuntype: Rt.Runtype<TransientOrigin> = Rt.Record({
  storage: Rt.Literal('transient'),
});

export const AnyOriginRuntype: Rt.Runtype<AnyOrigin> = Rt.Union(
  LocalOriginRuntype,
  ClusterOriginRuntype,
  PreviewOriginRuntype,
  TransientOriginRuntype
);

/*
 * Type guards
 */

export const isLocalOrigin = LocalOriginRuntype.guard;
export const isClusterOrigin = ClusterOriginRuntype.guard;
export const isPreviewOrigin = PreviewOriginRuntype.guard;
export const isTransientOrigin = TransientOriginRuntype.guard;
export const isAnyOrigin = AnyOriginRuntype.guard;
