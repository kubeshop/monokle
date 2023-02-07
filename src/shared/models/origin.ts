import {AnyPreview, isAnyPreview} from './preview';

/*
 * Types
 */

export type LocalOrigin = {
  filePath: string;
  fileOffset: number;
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

export const isLocalOrigin = (origin: any): origin is LocalOrigin => {
  return typeof origin === 'object' && typeof origin.filePath === 'string' && typeof origin.fileOffset === 'number';
};

export const isClusterOrigin = (origin: any): origin is ClusterOrigin => {
  return typeof origin === 'object' && typeof origin.context === 'string';
};

export const isPreviewOrigin = (origin: any): origin is PreviewOrigin => {
  return typeof origin === 'object' && typeof origin.preview === 'object' && isAnyPreview(origin.preview);
};

export const isTransientOrigin = (origin: any): origin is TransientOrigin => {
  return typeof origin === 'object' && Object.keys(origin).length === 0;
};

export const isAnyOrigin = (origin: any): origin is AnyOrigin => {
  return (
    typeof origin === 'object' &&
    (isLocalOrigin(origin) || isClusterOrigin(origin) || isPreviewOrigin(origin) || isTransientOrigin(origin))
  );
};
