import {createAsyncThunk} from '@reduxjs/toolkit';

import {ERROR_MSG_FALLBACK, PREVIEW_PREFIX, ROOT_FILE_ENTRY} from '@constants/constants';

import {SetPreviewDataPayload} from '@redux/reducers/main';
import {createRejectionWithAlert} from '@redux/thunks/utils';

import {hasCommandFailed, runCommandInMainThread} from '@utils/commands';
import {errorMsg} from '@utils/error';
import {isDefined} from '@utils/filter';

import {AppDispatch} from '@monokle-desktop/shared/models/appDispatch';
import {RootState} from '@monokle-desktop/shared/models/rootState';

import {extractK8sResources} from './resource';

export const previewSavedCommand = createAsyncThunk<
  SetPreviewDataPayload,
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewSavedCommand', async (commandId, thunkAPI) => {
  try {
    const configState = thunkAPI.getState().config;
    const command = configState.projectConfig?.savedCommandMap?.[commandId];
    const rootFolderPath = thunkAPI.getState().main.fileMap[ROOT_FILE_ENTRY]?.filePath;

    if (!command) {
      throw new Error('Saved command not found!');
    }

    if (!rootFolderPath) {
      throw new Error("Couldn't find current working directory.");
    }

    const result = await runCommandInMainThread({
      commandId: command.id,
      cmd: command.content,
      args: [],
      cwd: rootFolderPath,
    });

    if (hasCommandFailed(result) || !isDefined(result.stdout)) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    const resources = extractK8sResources(result.stdout, PREVIEW_PREFIX + command.id);

    if (!resources.length) {
      return createRejectionWithAlert(
        thunkAPI,
        'Command Preview Failed',
        "The command ran successfully but the output didn't contain any kubernetes resources."
      );
    }

    return {
      previewResourceId: command.id,
      previewResources: resources,
    };
  } catch (err) {
    return createRejectionWithAlert(thunkAPI, 'Command Preview Error', errorMsg(err));
  }
});
