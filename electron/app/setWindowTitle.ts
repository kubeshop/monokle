import {BrowserWindow} from 'electron';

import {ROOT_FILE_ENTRY} from '@monokle-desktop/shared/constants/fileEntry';
import type {HelmChart, HelmValuesFile} from '@monokle-desktop/shared/models/helm';
import type {K8sResource} from '@monokle-desktop/shared/models/k8sResource';
import type {RootState} from '@monokle-desktop/shared/models/rootState';
import {isInPreviewModeSelector, kubeConfigContextSelector} from '@monokle-desktop/shared/utils/selectors';

export const setWindowTitle = (state: RootState, window: BrowserWindow, projectName?: String) => {
  if (window.isDestroyed()) {
    return;
  }

  const isInPreviewMode = isInPreviewModeSelector(state);
  const kubeConfigContext = kubeConfigContextSelector(state);
  const previewType = state.main.previewType;
  const previewResourceId = state.main.previewResourceId;
  const resourceMap = state.main.resourceMap;
  const previewValuesFileId = state.main.previewValuesFileId;
  const helmValuesMap = state.main.helmValuesMap;
  const helmChartMap = state.main.helmChartMap;
  const fileMap = state.main.fileMap;

  let previewResource: K8sResource | undefined;
  let previewValuesFile: HelmValuesFile | undefined;
  let helmChart: HelmChart | undefined;

  if (previewResourceId) {
    previewResource = resourceMap[previewResourceId];
  }

  if (previewValuesFileId && helmValuesMap[previewValuesFileId]) {
    const valuesFile = helmValuesMap[previewValuesFileId];
    previewValuesFile = valuesFile;
    helmChart = helmChartMap[valuesFile.helmChartId];
  }

  let windowTitle = 'Monokle';

  if (isInPreviewMode && previewType === 'kustomization') {
    windowTitle = previewResource ? `Monokle - previewing [${previewResource.name}] kustomization` : `Monokle`;
    window.setTitle(windowTitle);
    return;
  }
  if (isInPreviewMode && previewType === 'cluster') {
    windowTitle = `Monokle - previewing context [${kubeConfigContext}]` || 'Monokle';
    window.setTitle(windowTitle);
    return;
  }
  if (isInPreviewMode && previewType === 'helm') {
    windowTitle = `Monokle - previewing ${previewValuesFile?.name} for ${helmChart?.name} Helm chart`;
    window.setTitle(windowTitle);
    return;
  }
  if (fileMap && fileMap[ROOT_FILE_ENTRY] && fileMap[ROOT_FILE_ENTRY].filePath) {
    windowTitle = fileMap[ROOT_FILE_ENTRY].filePath;
    window.setTitle(`Monokle - ${projectName} -${windowTitle}`);
    return;
  }
  window.setTitle(windowTitle);
};
