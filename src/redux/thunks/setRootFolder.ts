import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';

import {currentConfigSelector} from '@redux/appConfig';
import {setChangedFiles, setGitLoading, setRepo} from '@redux/git';
import {getChangedFiles, getRepoInfo, isFolderGitRepo} from '@redux/git/git.ipc';
import {abortAllRunningRefsProcessing} from '@redux/parsing/parser.thunks';
import {SetRootFolderArgs, SetRootFolderPayload} from '@redux/reducers/main';
import {disconnectFromCluster} from '@redux/services/clusterResourceWatcher';
import {createRootFileEntry, readFiles} from '@redux/services/fileEntry';
import {monitorRootFolder} from '@redux/services/fileMonitor';
import {isKustomizationResource} from '@redux/services/kustomize';
import {createRejectionWithAlert} from '@redux/thunks/utils';
import {abortAllRunningValidation} from '@redux/validation/validation.thunks';

import {getFileStats} from '@utils/files';
import {showGitErrorModal} from '@utils/terminal';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileMapType, HelmChartMapType, HelmTemplatesMapType, HelmValuesMapType} from '@shared/models/appState';
import {ResourceContentMap, ResourceMetaMap} from '@shared/models/k8sResource';
import {RootState} from '@shared/models/rootState';
import {isInClusterModeSelector} from '@shared/utils';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Thunk to set the specified root folder
 */

export const setRootFolder = createAsyncThunk<
  SetRootFolderPayload,
  SetRootFolderArgs,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/setRootFolder', async ({rootFolder, isReload}, thunkAPI) => {
  const startTime = new Date().getTime();
  const projectConfig = currentConfigSelector(thunkAPI.getState());

  const resourceMetaMap: ResourceMetaMap<'local'> = {};
  const resourceContentMap: ResourceContentMap<'local'> = {};
  const fileMap: FileMapType = {};
  const helmChartMap: HelmChartMapType = {};
  const helmValuesMap: HelmValuesMapType = {};
  const helmTemplatesMap: HelmTemplatesMapType = {};

  if (!rootFolder) {
    return {
      projectConfig,
      fileMap,
      resourceMetaMap,
      resourceContentMap,
      helmChartMap,
      helmValuesMap,
      helmTemplatesMap,
    };
  }

  const stats = getFileStats(rootFolder);

  if (!stats) {
    return createRejectionWithAlert(thunkAPI, 'Missing folder', `Folder ${rootFolder} does not exist`);
  }

  if (!stats.isDirectory()) {
    return createRejectionWithAlert(thunkAPI, 'Invalid path', `Specified path ${rootFolder} is not a folder`);
  }

  if (isInClusterModeSelector(thunkAPI.getState())) {
    disconnectFromCluster();
  }

  const rootEntry = createRootFileEntry(rootFolder, fileMap);

  // this Promise is needed for `setRootFolder.pending` action to be dispatched correctly
  const readFilesPromise = new Promise<string[]>(resolve => {
    setImmediate(() => {
      resolve(
        readFiles(rootFolder, {
          projectConfig,
          resourceMetaMap,
          resourceContentMap,
          fileMap,
          helmChartMap,
          helmValuesMap,
          helmTemplatesMap,
        })
      );
    });
  });
  const files = await readFilesPromise;

  rootEntry.children = files;

  monitorRootFolder(rootFolder, thunkAPI);
  abortAllRunningValidation();
  abortAllRunningRefsProcessing();

  const filesNumber = Object.values(fileMap).filter(f => !f.children).length;
  const resourcesNumber = Object.values(resourceMetaMap).length;
  const helmChartsNumber = Object.values(helmChartMap).length;
  const valuesFilesNumber = Object.values(helmValuesMap).length;
  const overlaysNumber = Object.values(resourceMetaMap).filter(r => isKustomizationResource(r)).length;

  const generatedAlert = {
    title: 'Folder Import',
    message: `Found ${resourcesNumber} resources, ${helmChartsNumber} Helm charts and ${overlaysNumber} Kustomize overlays configurations in ${filesNumber} files processed.`,
    type: AlertEnum.Success,
    silent: true,
  };

  let isGitRepo: boolean;

  try {
    isGitRepo = await isFolderGitRepo({path: rootFolder});
  } catch (err) {
    isGitRepo = false;
  }

  if (isGitRepo) {
    thunkAPI.dispatch(setGitLoading(true));

    Promise.allSettled([getRepoInfo({path: rootFolder}), getChangedFiles({localPath: rootFolder, fileMap})]).then(
      ([repo, changedFiles]) => {
        if (repo.status === 'rejected' || changedFiles.status === 'rejected') {
          const errorMessage =
            'reason' in repo ? repo.reason : 'reason' in changedFiles ? changedFiles.reason : undefined;
          log.error(errorMessage);
          showGitErrorModal('Git error', errorMessage);
          thunkAPI.dispatch(setGitLoading(false));
          return;
        }

        if (typeof repo.value !== 'object') {
          thunkAPI.dispatch(setRepo(undefined));
          thunkAPI.dispatch(setGitLoading(false));
          return;
        }

        thunkAPI.dispatch(setRepo(repo.value));
        thunkAPI.dispatch(setChangedFiles(changedFiles.value));
        thunkAPI.dispatch(setGitLoading(false));

        if (repo.value.remoteRepo.authRequired) {
          showGitErrorModal('Authentication failed', undefined, `git remote show origin`, thunkAPI.dispatch);
        }
      }
    );
  }

  const endTime = new Date().getTime();

  trackEvent('app_start/open_project', {
    numberOfFiles: filesNumber,
    numberOfResources: resourcesNumber,
    numberOfOverlays: overlaysNumber,
    numberOfHelmCharts: helmChartsNumber,
    numberOfValuesFiles: valuesFilesNumber,
    executionTime: endTime - startTime,
  });

  // TODO: process resources in validation listener after folder was loaded

  return {
    projectConfig,
    fileMap,
    resourceMetaMap,
    resourceContentMap,
    helmChartMap,
    helmValuesMap,
    helmTemplatesMap,
    isScanExcludesUpdated: 'applied',
    isScanIncludesUpdated: 'applied',
    alert: rootFolder ? generatedAlert : undefined,
    isGitRepo,
    isReload,
  };
});
