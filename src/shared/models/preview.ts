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

export const isHelmPreview = (preview: AnyPreview): preview is HelmPreview =>
  preview.type === 'helm' &&
  'valuesFileId' in preview &&
  typeof preview.valuesFileId === 'string' &&
  'chartId' in preview &&
  typeof preview.chartId === 'string';

export const isHelmConfigPreview = (preview: AnyPreview): preview is HelmConfigPreview =>
  preview.type === 'helm-config' && 'configId' in preview && typeof preview.configId === 'string';

export const isKustomizePreview = (preview: AnyPreview): preview is KustomizePreview =>
  preview.type === 'kustomize' && 'kustomizationId' in preview && typeof preview.kustomizationId === 'string';

export const isCommandPreview = (preview: AnyPreview): preview is CommandPreview =>
  preview.type === 'command' && 'commandId' in preview && typeof preview.commandId === 'string';

export const isAnyPreview = (preview: any): preview is AnyPreview => {
  return (
    typeof preview === 'object' &&
    'type' in preview &&
    (isHelmPreview(preview) || isHelmConfigPreview(preview) || isKustomizePreview(preview) || isCommandPreview(preview))
  );
};
