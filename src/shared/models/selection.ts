import {ResourceIdentifier, ResourceStorage, isResourceIdentifier} from './k8sResource';

export type FileSelection = {
  type: 'file';
  filePath: string;
};

export type HelmValuesFileSelection = {
  type: 'helm.values.file';
  valuesFileId: string;
};

export type ResourceSelection<Storage extends ResourceStorage = ResourceStorage> = {
  type: 'resource';
  resourceIdentifier: ResourceIdentifier<Storage>;
};

export type ImageSelection = {
  type: 'image';
  imageId: string;
};

export type CommandSelection = {
  type: 'command';
  commandId: string;
};

export type PreviewConfigurationSelection = {
  type: 'preview.configuration';
  previewConfigurationId: string;
};

export type AppSelection =
  | FileSelection
  | HelmValuesFileSelection
  | ResourceSelection
  | ImageSelection
  | CommandSelection
  | PreviewConfigurationSelection;

export const isFileSelection = (selection: any): selection is FileSelection => {
  return typeof selection === 'object' && 'type' in selection && selection.type === 'file' && 'filePath' in selection;
};

export const isHelmValuesFileSelection = (selection: any): selection is HelmValuesFileSelection => {
  return (
    typeof selection === 'object' && selection.type === 'helm.values.file' && typeof selection.valuesFileId === 'string'
  );
};

export const isResourceSelection = (selection: any): selection is ResourceSelection => {
  return (
    typeof selection === 'object' && selection.type === 'resource' && isResourceIdentifier(selection.resourceIdentifier)
  );
};

export const isImageSelection = (selection: any): selection is ImageSelection => {
  return typeof selection === 'object' && selection.type === 'image' && typeof selection.imageId === 'string';
};

export const isCommandSelection = (selection: any): selection is CommandSelection => {
  return typeof selection === 'object' && selection.type === 'command' && typeof selection.commandId === 'string';
};

export const isPreviewConfigurationSelection = (selection: any): selection is PreviewConfigurationSelection => {
  return (
    typeof selection === 'object' &&
    selection.type === 'preview.configuration' &&
    typeof selection.previewConfigurationId === 'string'
  );
};
