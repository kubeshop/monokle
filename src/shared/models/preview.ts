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
  preview.type === 'helm' &&
  typeof preview.valuesFileId === 'string' &&
  typeof preview.chartId === 'string';

export const isHelmConfigPreview = (preview: any): preview is HelmConfigPreview =>
  typeof preview === 'object' && preview.type === 'helm-config' && typeof preview.configId === 'string';

export const isKustomizePreview = (preview: any): preview is KustomizePreview =>
  typeof preview === 'object' && preview.type === 'kustomize' && typeof preview.kustomizationId === 'string';

export const isCommandPreview = (preview: any): preview is CommandPreview =>
  typeof preview === 'object' && preview.type === 'command' && typeof preview.commandId === 'string';

export const isAnyPreview = (preview: any): preview is AnyPreview => {
  return (
    isHelmPreview(preview) || isHelmConfigPreview(preview) || isKustomizePreview(preview) || isCommandPreview(preview)
  );
};
