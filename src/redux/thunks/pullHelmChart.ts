import {createAsyncThunk} from '@reduxjs/toolkit';

import {setAlert} from '@redux/reducers/alert';

import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {helmPullChartCommand, runCommandInMainThread} from '@shared/utils/commands';

export const pullHelmChart = createAsyncThunk<
  void,
  {name: string; path: string},
  {dispatch: AppDispatch; state: RootState}
>('main/pullHelmChart', async ({name, path}, {dispatch}) => {
  const result = await runCommandInMainThread(helmPullChartCommand({name, path}));
  if (result.stderr) {
    dispatch(setAlert({type: AlertEnum.Error, title: 'Pull Helm Chart', message: "Couldn't pull chart"}));
    throw new Error(result.stderr);
  }

  dispatch(setAlert({type: AlertEnum.Success, title: 'Pull Helm Chart', message: `${name} Chart pulled successfully`}));
});
