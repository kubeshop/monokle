import * as Rt from 'runtypes';

import {ResourceOriginRuntype} from './origin';

const FileSelectionRuntype = Rt.Record({
  type: Rt.Literal('file'),
  filePath: Rt.String,
});

const ResourceSelectionRuntype = Rt.Record({
  type: Rt.Literal('resource'),
  resourceOrigin: ResourceOriginRuntype,
  resourceId: Rt.String,
});

const ImageSelectionRuntype = Rt.Record({
  type: Rt.Literal('image'),
  imageId: Rt.String,
});

const CommandSelectionRuntype = Rt.Record({
  type: Rt.Literal('command'),
  commandId: Rt.String,
});

const AppSelectionRuntype = Rt.Union(
  FileSelectionRuntype,
  ResourceSelectionRuntype,
  ImageSelectionRuntype,
  CommandSelectionRuntype
);

export type FileSelection = Rt.Static<typeof FileSelectionRuntype>;
export type ResourceSelection = Rt.Static<typeof ResourceSelectionRuntype>;
export type ImageSelection = Rt.Static<typeof ImageSelectionRuntype>;
export type CommandSelection = Rt.Static<typeof CommandSelectionRuntype>;
export type AppSelection = Rt.Static<typeof AppSelectionRuntype>;

export const isFileSelection = FileSelectionRuntype.guard;
export const isResourceSelection = ResourceSelectionRuntype.guard;
export const isImageSelection = ImageSelectionRuntype.guard;
export const isCommandSelection = CommandSelectionRuntype.guard;
export const isAppSelection = AppSelectionRuntype.guard;
