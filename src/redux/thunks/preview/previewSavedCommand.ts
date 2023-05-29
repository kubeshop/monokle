import {createAsyncThunk} from '@reduxjs/toolkit';

import {createRejectionWithAlert} from '@redux/thunks/utils';

import {errorMsg} from '@utils/error';

import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AppDispatch} from '@shared/models/appDispatch';
import {K8sResource} from '@shared/models/k8sResource';
import {CommandPreview} from '@shared/models/preview';
import {RootState} from '@shared/models/rootState';
import {hasCommandFailed, runCommandInMainThread} from '@shared/utils/commands';
import {isDefined} from '@shared/utils/filter';
import {trackEvent} from '@shared/utils/telemetry';

import {extractK8sResources} from '../../services/resource';

export const previewSavedCommand = createAsyncThunk<
  {
    resources: K8sResource<'preview'>[];
    preview: CommandPreview;
  },
  string,
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/previewSavedCommand', async (commandId, thunkAPI) => {
  const startTime = new Date().getTime();
  try {
    const configState = thunkAPI.getState().config;
    const command = configState.projectConfig?.savedCommandMap?.[commandId];
    const rootFolderPath = thunkAPI.getState().main.fileMap[ROOT_FILE_ENTRY]?.filePath;

    trackEvent('preview/command/start');

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

    const resources = extractK8sResources(result.stdout, 'preview', {
      preview: {type: 'command', commandId: command.id},
    });

    if (!resources.length) {
      return createRejectionWithAlert(
        thunkAPI,
        'Command Preview Failed',
        "The command ran successfully but the output didn't contain any kubernetes resources."
      );
    }

    const endTime = new Date().getTime();
    trackEvent('preview/command/end', {resourcesCount: resources.length, executionTime: endTime - startTime});

    return {
      previewResourceId: command.id,
      previewResources: resources,
    };
  } catch (err) {
    let reason = errorMsg(err);
    trackEvent('preview/command/fail', {reason});
    return createRejectionWithAlert(thunkAPI, 'Command Preview Error', reason);
  }
});
