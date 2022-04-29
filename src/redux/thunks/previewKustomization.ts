import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';

import {ERROR_MSG_FALLBACK, ROOT_FILE_ENTRY} from '@constants/constants';

import {ProjectConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {currentConfigSelector} from '@redux/selectors';
import {getK8sVersion} from '@redux/services/projectConfig';
import {createPreviewResult, createRejectionWithAlert} from '@redux/thunks/utils';

import {CommandResult, hasCommandFailed, runCommandInMainThread} from '@utils/command';
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
  const projectConfig = currentConfigSelector(thunkAPI.getState());
  const k8sVersion = getK8sVersion(projectConfig);
  const userDataDir = thunkAPI.getState().config.userDataDir;
  const resource = state.resourceMap[resourceId];

  if (resource && resource.filePath) {
    const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
    const folder = path.join(rootFolder, path.dirname(resource.filePath));

    log.info(`previewing ${resource.id} in folder ${folder}`);
    const result = await runKustomize(folder, projectConfig);

    trackEvent(DO_KUSTOMIZE_PREVIEW);

    if (hasCommandFailed(result)) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      return createRejectionWithAlert(thunkAPI, 'Kustomize Error', msg);
    }

    if (result.stdout) {
      return createPreviewResult(
        k8sVersion,
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
