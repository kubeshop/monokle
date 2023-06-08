import {isLocalResourceMeta} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';

type PreviewDisplayContent = {
  name: string;
  description: string;
};

export const selectPreviewDisplayContent = (state: RootState): PreviewDisplayContent => {
  const preview = state.main.preview;

  switch (preview?.type) {
    case 'command': {
      const commandId = preview.commandId;
      const command = state.config.projectConfig?.savedCommandMap?.[commandId];
      return {
        name: command?.label ?? 'command',
        description: command?.content
          ? `You are previewing a custom command which executed ${command?.content}.`
          : 'You are previewing a custom command.',
      };
    }
    case 'helm': {
      const helmId = preview.chartId;
      const helmChart = state.main.helmChartMap[helmId];
      if (!helmChart) return {name: 'Helm Chart', description: 'You are dry-running a Helm Chart.'};
      return {
        name: helmChart.name,
        description: `You are dry-running ${helmChart.name} located at ${helmChart.filePath}.`,
      };
    }
    case 'helm-config': {
      const helmId = preview.configId;
      const helmConfig = state.config.projectConfig?.helm?.previewConfigurationMap?.[helmId];
      if (!helmConfig) return {name: 'Helm Chart', description: 'You are dry-running a Helm Chart.'};
      const helmChart = state.main.helmChartMap[helmId];
      return {
        name: helmConfig.name,
        description: helmChart
          ? `You are previewing ${helmConfig.name} located at ${helmChart.filePath}.`
          : `You are previewing ${helmConfig.name}.`,
      };
    }
    case 'kustomize': {
      const kustomizationId = preview.kustomizationId;
      const kustomization = state.main.resourceMetaMapByStorage.local[kustomizationId];
      if (!isLocalResourceMeta(kustomization)) {
        return {
          name: 'Kustomize overlay',
          description: `You are dry-running a Kustomize overlay.`,
        };
      }
      return {
        name: 'Kustomize overlay',
        description: `You are dry-running a Kustomize overlay located at ${kustomization.origin.filePath}.`,
      };
    }
    default:
      return {
        name: 'resources',
        description: 'You are previewing Kubernetes resources.',
      };
  }
};
