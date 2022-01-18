import {FSWatcher, watch} from 'chokidar';

import {AppDispatch} from '@redux/store';

import {CONFIG_PATH, readApplicationConfigFileAndUpdateProjectSettings} from './projectConfig';

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
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, dispatch);
    })
    .on('change', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, dispatch);
    })
    .on('unlink', () => {
      readApplicationConfigFileAndUpdateProjectSettings(absolutePath, dispatch);
    })
    // eslint-disable-next-line no-console
    .on('error', error => console.log(`Watcher error: ${error}`));

  /* eslint-disable no-console */
}
