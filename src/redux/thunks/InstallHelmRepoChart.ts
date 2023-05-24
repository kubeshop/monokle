import {createAsyncThunk} from '@reduxjs/toolkit';

import {setAlert} from '@redux/reducers/alert';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {installHelmRepoChartCommand, runCommandInMainThread} from '@shared/utils/commands';
import {kubeConfigPathSelector} from '@shared/utils';
import {errorAlert, successAlert} from '@utils/alert';

export const installHelmRepoChart = createAsyncThunk<
  void,
  {name: string; chart: string; namespace?: string; version?: string},
  {dispatch: AppDispatch; state: RootState}
>('main/installHelmRepoChart', async ({name, chart, namespace, version}, {dispatch, getState}) => {
  const kubeconfig = kubeConfigPathSelector(getState());
  const result = await runCommandInMainThread(
    installHelmRepoChartCommand(
      {name, chart, namespace, version},
      {
        KUBECONFIG: kubeconfig,
      }
    )
  );
  if (result.stderr) {
    dispatch(setAlert(errorAlert('Install Helm Chart', "Couldn't install chart")));
    throw new Error(result.stderr);
  }

  dispatch(setAlert(successAlert('Install Helm Chart', `${name} Chart installed successfully`)));
});
