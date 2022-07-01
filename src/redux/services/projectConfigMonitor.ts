import {FSWatcher, watch} from 'chokidar';
import log from 'loglevel';

import {AppDispatch} from '@models/appdispatch';

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
    .on('add', () => {
      updateProjectSettings(dispatch, filePath);
    })
    .on('change', () => {
      updateProjectSettings(dispatch, filePath);
    })
    .on('unlink', () => {
      updateProjectSettings(dispatch, filePath);
    })

    .on('error', error => log.error(`Watcher error: ${error}`));
}
