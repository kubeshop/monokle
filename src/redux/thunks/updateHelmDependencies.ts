import {createAsyncThunk} from '@reduxjs/toolkit';

import path, {dirname} from 'path';

import {setAlert} from '@redux/reducers/alert';

import {errorAlert, successAlert} from '@utils/alert';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {hasCommandFailed, runCommandInMainThread} from '@shared/utils/commands';

export const updateHelmDependencies = createAsyncThunk<
  void,
  {rootFolderPath: string; filePaths: string[]},
  {dispatch: AppDispatch; state: RootState}
>('main/updateHelmDependencies', async ({rootFolderPath, filePaths}, {dispatch, getState}) => {
  if (!rootFolderPath) {
    throw new Error("Couldn't find current working directory.");
  }

  if (filePaths.length === 0) {
    throw new Error("Couldn't find current working file.");
  }
  filePaths.forEach(async (filePath: string) => {
    const result = await runCommandInMainThread({
      commandId: 'helm/command',
      cmd: 'helm',
      args: ['dependency', 'update'],
      cwd: dirname(path.join(rootFolderPath, filePath)),
    });

    if (hasCommandFailed(result)) {
      dispatch(setAlert(errorAlert(`Helm Dependency could not be updated for path ${filePath}`, result.stderr)));
      throw new Error(result.stderr);
    }
    dispatch(setAlert(successAlert('Update Helm Dependencies', `Helm Dependencies updated successfully`)));
  });
});
