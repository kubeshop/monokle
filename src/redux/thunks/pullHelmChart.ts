import {createAsyncThunk} from '@reduxjs/toolkit';

import {setAlert} from '@redux/reducers/alert';
import {setLeftMenuSelection} from '@redux/reducers/ui';

import {errorAlert, successAlert} from '@utils/alert';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {helmPullChartCommand, runCommandInMainThread} from '@shared/utils/commands';

import {setOpenProject} from './project';

export const pullHelmChart = createAsyncThunk<
  void,
  {name: string; path: string; version?: string},
  {dispatch: AppDispatch; state: RootState}
>('main/pullHelmChart', async ({name, path, version}, {dispatch, getState}) => {
  const projectRootFolder = getState().config.selectedProjectRootFolder || path;

  const result = await runCommandInMainThread(helmPullChartCommand({name, path, version}));
  if (result.stderr) {
    dispatch(setAlert(errorAlert("Couldn't pull chart", result.stderr)));

    throw new Error(result.stderr);
  }

  dispatch(
    setAlert(
      successAlert('Pull Helm Chart', `${name} Chart pulled successfully. You can browse the it from the File explorer`)
    )
  );

  if (!path.startsWith(projectRootFolder)) {
    dispatch(setOpenProject(path));
  }

  dispatch(setLeftMenuSelection('explorer'));
});
