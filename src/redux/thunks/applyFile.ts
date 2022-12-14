import fs from 'fs';
import log from 'loglevel';

import {setAlert} from '@redux/reducers/alert';
import {setApplyingResource} from '@redux/reducers/main';
import {getAbsoluteFileEntryPath} from '@redux/services/fileEntry';
import {applyYamlToCluster} from '@redux/thunks/applyYaml';

import {errorAlert} from '@utils/alert';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {AppDispatch} from '@shared/models/appDispatch';
import {FileMapType} from '@shared/models/appState';
import {trackEvent} from '@shared/utils/telemetry';

/**
 * Invokes kubectl for the content of the specified resource
 */

function applyFileToCluster(filePath: string, kubeconfig: string, context: string) {
  return applyYamlToCluster({
    yaml: fs.readFileSync(filePath, 'utf8'),
    kubeconfig,
    context,
  });
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
  dispatch(setApplyingResource(true));

  try {
    trackEvent('cluster/deploy_file');
    const fileEntry = fileMap[filePath];
    if (fileEntry && !fileEntry.children) {
      try {
        const result = await applyFileToCluster(getAbsoluteFileEntryPath(fileEntry, fileMap), kubeconfig, context);

        if (result.exitCode && result.exitCode !== 0) {
          log.info(`Apply exited with code ${result.exitCode} and signal ${result.signal}`);
        }

        if (result.stdout) {
          const alert: AlertType = {
            type: AlertEnum.Success,
            title: 'Apply completed',
            message: result.stdout,
          };
          dispatch(setAlert(alert));
        }

        if (result.stderr) {
          const alert: AlertType = {
            type: AlertEnum.Error,
            title: 'Apply failed',
            message: result.stderr,
          };
          dispatch(setAlert(alert));
        }
      } catch (e: any) {
        log.error(e);
        dispatch(setAlert(errorAlert('Deploy failed', e.message)));
      }
    }
  } catch (e: any) {
    log.error(e);
    dispatch(setAlert(errorAlert('Deploy failed', e.message)));
  }

  dispatch(setApplyingResource(false));
}
