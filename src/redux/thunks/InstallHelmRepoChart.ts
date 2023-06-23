import {createAsyncThunk} from '@reduxjs/toolkit';

import {setAlert} from '@redux/reducers/alert';

import {errorAlert, successAlert} from '@utils/alert';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {kubeConfigPathSelector} from '@shared/utils';
import {installHelmRepoChartCommand, runCommandInMainThread} from '@shared/utils/commands';

export const installHelmRepoChart = createAsyncThunk<
  void,
  {chart: string; namespace?: string; version?: string; shouldCreateNamespace?: boolean},
  {dispatch: AppDispatch; state: RootState}
>('main/installHelmRepoChart', async ({chart, namespace, version, shouldCreateNamespace}, {dispatch, getState}) => {
  const kubeconfig = kubeConfigPathSelector(getState());
  const result = await runCommandInMainThread(
    installHelmRepoChartCommand(
      {chart, namespace, version, shouldCreateNamespace},
      {
        KUBECONFIG: kubeconfig,
      }
    )
  );
  if (result.stderr) {
    dispatch(setAlert(errorAlert('Install Helm Chart', result.stderr)));
  }

  dispatch(setAlert(successAlert('Install Helm Chart', `${chart} Chart installed successfully`)));
});
