import {FSWatcher, watch} from 'chokidar';
import {statSync} from 'fs';
import log from 'loglevel';

import {AppDispatch} from '@shared/models/appDispatch';
import {getProjectConfigTimestamp} from '@shared/utils/projectConfig';

import {CONFIG_PATH, updateProjectSettings} from './projectConfig';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorProjectConfigFile(dispatch: AppDispatch, filePath?: string | null) {
  if (!filePath && watcher) {
    watcher.close();
    return;
  }
  if (watcher) {
    watcher.close();
  }

  const absolutePath = CONFIG_PATH(filePath);

  watcher = watch(absolutePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher
    .on('change', () => {
      if (!filePath) {
        return;
      }

      if (statSync(absolutePath).mtimeMs !== getProjectConfigTimestamp()) {
        updateProjectSettings(dispatch, filePath);
      }
    })
    .on('unlink', () => {
      if (!filePath) {
        return;
      }

      updateProjectSettings(dispatch, filePath);
    })

    .on('error', error => log.error(`Watcher error: ${error}`));
}
