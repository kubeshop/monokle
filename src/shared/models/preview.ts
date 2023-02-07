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

export type PreviewType = AnyPreview['type'];

export const isHelmPreview = (preview: any): preview is HelmPreview =>
  typeof preview === 'object' &&
  'type' in preview &&
  preview.type === 'helm' &&
  'valuesFileId' in preview &&
  typeof preview.valuesFileId === 'string' &&
  'chartId' in preview &&
  typeof preview.chartId === 'string';

export const isHelmConfigPreview = (preview: any): preview is HelmConfigPreview =>
  typeof preview === 'object' &&
  'type' in preview &&
  preview.type === 'helm-config' &&
  'configId' in preview &&
  typeof preview.configId === 'string';

export const isKustomizePreview = (preview: any): preview is KustomizePreview =>
  typeof preview === 'object' &&
  'type' in preview &&
  preview.type === 'kustomize' &&
  'kustomizationId' in preview &&
  typeof preview.kustomizationId === 'string';

export const isCommandPreview = (preview: any): preview is CommandPreview =>
  typeof preview === 'object' &&
  'type' in preview &&
  preview.type === 'command' &&
  'commandId' in preview &&
  typeof preview.commandId === 'string';

export const isAnyPreview = (preview: any): preview is AnyPreview => {
  return (
    isHelmPreview(preview) || isHelmConfigPreview(preview) || isKustomizePreview(preview) || isCommandPreview(preview)
  );
};
