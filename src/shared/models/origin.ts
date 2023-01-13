import * as Rt from 'runtypes';

import {AnyPreview, AnyPreviewRuntype} from './preview';

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
export type PreviewOrigin = {
  type: 'preview';
  preview: AnyPreview;
};

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
export const PreviewOriginRuntype: Rt.Runtype<PreviewOrigin> = Rt.Record({
  type: Rt.Literal('preview'),
  preview: AnyPreviewRuntype,
});

export const AnyOriginRuntype: Rt.Runtype<AnyOrigin> = Rt.Union(
  LocalOriginRuntype,
  ClusterOriginRuntype,
  PreviewOriginRuntype
);

/*
 * Type guards
 */

export const isLocalOrigin = LocalOriginRuntype.guard;
export const isClusterOrigin = ClusterOriginRuntype.guard;
export const isPreviewOrigin = PreviewOriginRuntype.guard;
export const isAnyOrigin = AnyOriginRuntype.guard;
