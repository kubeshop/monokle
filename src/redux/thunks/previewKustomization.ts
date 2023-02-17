import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path from 'path';
import {v4 as uuid} from 'uuid';

import {currentConfigSelector} from '@redux/selectors';
import {extractK8sResources, joinK8sResource} from '@redux/services/resource';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppDispatch} from '@shared/models/appDispatch';
import {CommandResult} from '@shared/models/commands';
import {ProjectConfig} from '@shared/models/config';
import {K8sResource} from '@shared/models/k8sResource';
import {KustomizePreview} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {hasCommandFailed, runCommandInMainThread} from '@shared/utils/commands';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Thunk to preview kustomizations
 */

export const previewKustomization = createAsyncThunk<
  {
    resources: K8sResource<'preview'>[];
    preview: KustomizePreview;
  },
  string,
  {dispatch: AppDispatch; state: RootState}
>('main/previewKustomization', async (resourceId, thunkAPI) => {
  trackEvent('preview/kustomize/start');
  const startTime = new Date().getTime();
  const state = thunkAPI.getState().main;
  const projectConfig = currentConfigSelector(thunkAPI.getState());

  const kustomizationMeta = state.resourceMetaMapByStorage.local[resourceId];
  const kustomizationContent = state.resourceContentMapByStorage.local[resourceId];

  if (!kustomizationMeta || !kustomizationContent) {
    log.error(`Couldn't find the meta or content for kustomization with id ${resourceId}`);
    return {};
  }

  const kustomization = joinK8sResource(kustomizationMeta, kustomizationContent);

  const rootFolder = state.fileMap[ROOT_FILE_ENTRY].filePath;
  const folder = path.join(rootFolder, path.dirname(kustomization.origin.filePath));

  log.info(`Previewing kustomization with id ${kustomization.id} in folder ${folder}`);
  const result = await runKustomize(folder, projectConfig);

  if (hasCommandFailed(result)) {
    const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
    return createRejectionWithAlert(thunkAPI, 'Kustomize Error', msg);
  }

  const endTime = new Date().getTime();

  trackEvent('preview/kustomize/end', {executionTime: endTime - startTime});

  if (!result.stdout) {
    log.warn("Couldn't find any resources in the preview output");
    return {};
  }

  const preview = {type: 'kustomize', kustomizationId: kustomization.id} as const;

  const resources = extractK8sResources(result.stdout, 'preview', {
    preview,
  });

  return {
    resources,
    preview,
  };
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
    commandId: uuid(),
    cmd: projectConfig?.settings?.kustomizeCommand ? String(projectConfig.settings.kustomizeCommand) : 'kubectl',
    args,
    env: {
      KUBECONFIG: projectConfig.kubeConfig?.path,
    },
  });
}
