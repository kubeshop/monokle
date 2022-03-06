import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {CommandResult, runCommandInMainThread} from '@utils/command';
import {DO_KUSTOMIZE_PREVIEW, trackEvent} from '@utils/telemetry';


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
    const folder = path.join(rootFolder, path.dirname(resource.filePath));

    log.info(`previewing ${resource.id} in folder ${folder}`);
    const result = await runKustomize(folder, projectConfig);

    trackEvent(DO_KUSTOMIZE_PREVIEW);

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

export function runKustomize(
  folder: string,
  projectConfig: ProjectConfig,
  applyArgs?: string[]
): Promise<CommandResult> {
  const args: string[] = [];

  // use kustomize?
  if (projectConfig?.settings?.kustomizeCommand === 'kustomize') {
    args.push('build');
    if (projectConfig.settings?.enableHelmWithKustomize) {
      args.push('--enable-helm ');
    }
    args.push(`"${folder}"`);
  } else {
    // preview using kubectl
    args.push('kustomize');
    args.push(`"${folder}"`);

    if (projectConfig.settings?.enableHelmWithKustomize) {
      args.push('--enable-helm ');
    }
  }

  // apply using kubectl
  if (applyArgs) {
    args.push(...['|', 'kubectl']);
    args.push(...applyArgs);
    args.push(...['apply', '-f', '-']);
  }

  return runCommandInMainThread({
    cmd: projectConfig?.settings?.kustomizeCommand ? String(projectConfig.settings.kustomizeCommand) : 'kubectl',
    args,
    env: {
      KUBECONFIG: projectConfig.kubeConfig?.path,
    },
  });
}
