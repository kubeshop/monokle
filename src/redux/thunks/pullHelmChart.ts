import {createAsyncThunk} from '@reduxjs/toolkit';

import path from 'path';

import {setAlert} from '@redux/reducers/alert';
import {selectFile} from '@redux/reducers/main';
import {setExplorerSelectedSection, setLeftMenuSelection} from '@redux/reducers/ui';
import {setRootFolder} from '@redux/thunks/setRootFolder';

import {errorAlert, successAlert} from '@utils/alert';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {helmPullChartCommand, runCommandInMainThread} from '@shared/utils/commands';

import {setOpenProject} from './project';

export const pullHelmChart = createAsyncThunk<
  void,
  {name: string; chartPath: string; version?: string},
  {dispatch: AppDispatch; state: RootState}
>('main/pullHelmChart', async ({name, chartPath, version}, {dispatch, getState}) => {
  const projectRootFolder = getState().config.selectedProjectRootFolder || chartPath;

  const result = await runCommandInMainThread(helmPullChartCommand({name, path: chartPath, version}));
  if (result.stderr) {
    dispatch(setAlert(errorAlert("Couldn't pull chart", result.stderr)));
    throw new Error(result.stderr);
  }

  dispatch(setAlert(successAlert('Pull Helm Chart', `${name} Chart pulled successfully.`)));

  if (!chartPath.startsWith(projectRootFolder)) {
    await dispatch(setOpenProject(chartPath));
  } else {
    // force reloading before selecting the file below - otherwise it won't have been found/synced from the file system
    await dispatch(setRootFolder({rootFolder: projectRootFolder, isReload: true}));
  }

  const filePath = path.sep + path.join(name.substring(name.indexOf('/') + 1), 'Chart.yaml');

  dispatch(setLeftMenuSelection('explorer'));
  dispatch(setExplorerSelectedSection('helm'));
  dispatch(selectFile({filePath}));
});
