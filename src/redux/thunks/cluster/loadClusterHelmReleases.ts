import {createAsyncThunk} from '@reduxjs/toolkit';

import {setHelmReleases} from '@redux/dashboard';
import {setAlert} from '@redux/reducers/alert';

import {errorAlert} from '@utils/alert';
import {listHelmReleasesCommand} from '@utils/helm';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {HelmRelease} from '@shared/models/ui';
import {runCommandInMainThread} from '@shared/utils/commands';

export const loadClusterHelmReleases = createAsyncThunk<HelmRelease[], void, {dispatch: AppDispatch; state: RootState}>(
  'dashboard/getHelmReleases',
  async (_, {dispatch, getState}) => {
    const selectedNamespace = getState().main.clusterConnection?.namespace;
    const helmRepoSearch = getState().ui.helmPane.chartSearchToken;

    const result = await runCommandInMainThread(
      listHelmReleasesCommand({
        filter: helmRepoSearch,
        namespace: selectedNamespace?.replace('<all>', '').replace('<not-namespaced>', ''),
      })
    );
    if (result.stderr) {
      dispatch(setAlert(errorAlert("Couldn't load cluster helm releases", result.stderr)));
    }
    const helmReleases = JSON.parse(result.stdout || '[]');
    dispatch(setHelmReleases(helmReleases));
    return helmReleases;
  }
);
