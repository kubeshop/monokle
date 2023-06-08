import {createAsyncThunk} from '@reduxjs/toolkit';

import log from 'loglevel';
import path, {dirname} from 'path';

import {createRejectionWithAlert} from '@redux/thunks/utils';

import {errorMsg} from '@utils/error';

import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';
import {ROOT_FILE_ENTRY} from '@shared/constants/fileEntry';
import {AlertEnum} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';
import {hasCommandFailed, runCommandInMainThread} from '@shared/utils/commands';
import {trackEvent} from '@shared/utils/telemetry';

export const runHelmCommand = createAsyncThunk<
  undefined,
  {
    chart: string;
    command: string[];
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('main/runHelmCommand', async (payload, thunkAPI) => {
  const rootFolderPath = thunkAPI.getState().main.fileMap[ROOT_FILE_ENTRY]?.filePath;
  const helmChartMap = thunkAPI.getState().main.helmChartMap;
  const {chart, command} = payload;

  trackEvent('helm/command/start', {command});
  try {
    if (command.length === 0) {
      throw new Error('Empty Helm Command..');
    }

    let helmChart = helmChartMap[chart];
    if (!helmChart) {
      throw new Error(`Uknown Helm Chart ${chart}`);
    }

    if (!rootFolderPath) {
      throw new Error("Couldn't find current working directory.");
    }

    const result = await runCommandInMainThread({
      commandId: 'helm/command',
      cmd: 'helm',
      args: command,
      cwd: dirname(path.join(rootFolderPath, helmChart.filePath)),
    });

    if (hasCommandFailed(result)) {
      const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
      throw new Error(msg);
    }

    log.info('Helm command', command, result.stdout);
    trackEvent('helm/command/end');

    return {
      alert: {
        title: `helm ${command.join(' ')} successful`,
        message: `For Helm Chart [${helmChart.name}]${
          result.stdout ? `\n\`\`\`${result.stdout}\n\`\`\`` : ' - no output'
        }`,
        type: AlertEnum.Success,
      },
    };
  } catch (err) {
    let reason = errorMsg(err);
    trackEvent('helm/command/fail', {reason});
    return createRejectionWithAlert(thunkAPI, `helm ${command.join(' ')} failed`, reason);
  }
});
