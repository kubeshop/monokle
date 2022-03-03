import {ipcRenderer} from 'electron';

import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {KustomizeCommandType} from '@models/kustomize';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {SpawnResult} from '@utils/kubectl';
import {ensureRendererThread} from '@utils/thread';

export type KustomizeCommandOptions = {
  folder: string;
  kustomizeCommand: KustomizeCommandType;
  applyArgs?: string[];
  enableHelm: boolean;
  kubeconfig?: string;
};

/**
 * Thunk to preview kustomizations
 */

export const previewKustomization = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewKustomization', async (resourceId, thunkAPI) => {
  const state = thunkAPI.getState().main;
  const k8sVersion = thunkAPI.getState().config.projectConfig?.k8sVersion;
  const userDataDir = thunkAPI.getState().config.userDataDir;
  const projectConfig = currentConfigSelector(thunkAPI.getState());
  const resource = state.resourceMap[resourceId];
  if (resource && resource.filePath) {
    const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
    const folder = path.join(rootFolder, resource.filePath.substr(0, resource.filePath.lastIndexOf(path.sep)));

    log.info(`previewing ${resource.id} in folder ${folder}`);
    const result = await runKustomizeInMainThread(folder, projectConfig);

    if (result.error) {
      return createRejectionWithAlert(thunkAPI, 'Kustomize Error', result.error);
    }

    if (result.stdout) {
      return createPreviewResult(
        String(k8sVersion),
        String(userDataDir),
        result.stdout,
        resource.id,
        'Kustomize Preview',
        state.resourceRefsProcessingOptions
      );
    }
  }

  return {};
});

/**
 * Invokes kustomize in main thread
 */

export function runKustomizeInMainThread(folder: string, projectConfig: ProjectConfig, applyArgs?: string[]) {
  ensureRendererThread();

  return new Promise<SpawnResult>(resolve => {
    ipcRenderer.once('kustomize-result', (event, arg) => {
      resolve(arg);
    });
    const kustomizeCommand = projectConfig?.settings?.kustomizeCommand || 'kubectl';
    const enableHelmWithKustomize = projectConfig?.settings?.enableHelmWithKustomize || false;
    const kubeconfig = projectConfig.kubeConfig?.path;

    ipcRenderer.send('run-kustomize', {
      folder,
      kustomizeCommand,
      enableHelm: enableHelmWithKustomize,
      applyArgs,
      kubeconfig,
    } as KustomizeCommandOptions);
  });
}
