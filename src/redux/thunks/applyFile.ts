import {spawn} from 'child_process';
import fs from 'fs';
import log from 'loglevel';

import {setAlert} from '@redux/reducers/alert';
import {setApplyingResource} from '@redux/reducers/main';
import {getAbsoluteFileEntryPath} from '@redux/services/fileEntry';
import {AppDispatch} from '@redux/store';

import {AlertEnum, AlertType} from '@models/alert';
import {FileMapType} from '@models/appstate';

import {PROCESS_ENV} from '@utils/env';
import {getShellPath} from '@utils/shell';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyFileToCluster(filePath: string, kubeconfig: string, context: string) {
  const child = spawn('kubectl', ['--context', context, 'apply', '-f', '-'], {
    env: {
      NODE_ENV: PROCESS_ENV.NODE_ENV,
      PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
      PATH: getShellPath(),
      KUBECONFIG: kubeconfig,
    },
  });
  child.stdin.write(fs.readFileSync(filePath, 'utf8'));
  child.stdin.end();
  return child;
}

/**
 * applies the specified file and creates corresponding alert
 *
 * this isn't actually a Thunk - but should be in the future!
 */

export async function applyFile(
  filePath: string,
  fileMap: FileMapType,
  dispatch: AppDispatch,
  kubeconfig: string,
  context: string
) {
  try {
    const fileEntry = fileMap[filePath];
    if (fileEntry && !fileEntry.children) {
      dispatch(setApplyingResource(true));

      try {
        const child = applyFileToCluster(getAbsoluteFileEntryPath(fileEntry, fileMap), kubeconfig, context);

        child.on('exit', (code, signal) => {
          log.info(`kubectl exited with code ${code} and signal ${signal}`);
          dispatch(setApplyingResource(false));
        });

        child.stdout.on('data', data => {
          const alert: AlertType = {
            type: AlertEnum.Success,
            title: 'Apply completed',
            message: data.toString(),
          };
          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        });

        child.stderr.on('data', data => {
          const alert: AlertType = {
            type: AlertEnum.Error,
            title: 'Apply failed',
            message: data.toString(),
          };
          dispatch(setAlert(alert));
          dispatch(setApplyingResource(false));
        });
      } catch (e: any) {
        log.error(e.message);
        dispatch(setApplyingResource(true));
      }
    }
  } catch (e) {
    log.error('Failed to apply file');
    log.error(e);

    dispatch(setApplyingResource(false));
  }
}
