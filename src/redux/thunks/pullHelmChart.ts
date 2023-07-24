import {createAsyncThunk} from '@reduxjs/toolkit';

import path from 'path';

import {setAlert} from '@redux/reducers/alert';
import {selectFile} from '@redux/reducers/main';
import {setExplorerSelectedSection, setIsInQuickClusterMode, setLeftMenuSelection} from '@redux/reducers/ui';

import {errorAlert, successAlert} from '@utils/alert';
import {helmPullChartCommand} from '@utils/helm';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {runCommandInMainThread} from '@shared/utils/commands';

import {setCreateProject, setOpenProject} from './project';

export const pullHelmChart = createAsyncThunk<
  void,
  {name: string; chartPath: string; version?: string},
  {dispatch: AppDispatch; state: RootState}
>('main/pullHelmChart', async ({name, chartPath, version}, {dispatch, getState}) => {
  const projectRootFolder = getState().config.selectedProjectRootFolder || getState().config.projectsRootPath;

  const result = await runCommandInMainThread(helmPullChartCommand({name, path: chartPath, version}));
  if (result.stderr) {
    dispatch(setAlert(errorAlert("Couldn't pull chart", result.stderr)));
    throw new Error(result.stderr);
  }

  dispatch(setAlert(successAlert('Pull Helm Chart', `${name} Chart pulled successfully.`)));

  if (!getState().config.selectedProjectRootFolder || !chartPath.startsWith(projectRootFolder)) {
    // create new project if no current project or specified folder is outside current project
    dispatch(setCreateProject({rootFolder: chartPath, name}));
  } else {
    // force reloading before selecting the file below - otherwise it won't have been found/synced from the file system
    await dispatch(setOpenProject(projectRootFolder)).unwrap();
  }
  dispatch(setIsInQuickClusterMode(false));

  const filePath = path.sep + path.join(name.substring(name.indexOf('/') + 1), 'Chart.yaml');

  dispatch(setLeftMenuSelection('explorer'));
  dispatch(setExplorerSelectedSection('helm'));
  dispatch(selectFile({filePath}));
});
