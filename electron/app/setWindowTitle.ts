import {BrowserWindow} from 'electron';

import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import type {RootState} from '@shared/models/rootState';

export const setWindowTitle = (state: RootState, window: BrowserWindow, projectName?: String) => {
  if (window.isDestroyed()) {
    return;
  }

  const preview = state.main.preview;
  const localResourceMetaMap = state.main.resourceMetaStorage.local;
  const clusterConnection = state.main.clusterConnection;
  const helmValuesMap = state.main.helmValuesMap;
  const helmChartMap = state.main.helmChartMap;
  const fileMap = state.main.fileMap;

  let windowTitle = 'Monokle';

  if (clusterConnection) {
    windowTitle = `Monokle - previewing context [${clusterConnection.context}]` || 'Monokle';
    window.setTitle(windowTitle);
    return;
  }

  if (preview?.type === 'kustomize') {
    const kustomization = localResourceMetaMap[preview.kustomizationId];
    windowTitle = kustomization ? `Monokle - previewing [${kustomization.name}] kustomization` : `Monokle`;
    window.setTitle(windowTitle);
    return;
  }

  if (preview?.type === 'helm') {
    const valuesFile = helmValuesMap[preview.valuesFileId];
    const helmChart = helmChartMap[valuesFile.helmChartId];

    windowTitle = `Monokle - previewing ${valuesFile?.name} for ${helmChart?.name} Helm chart`;
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
