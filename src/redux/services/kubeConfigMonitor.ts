import {watch, FSWatcher} from 'chokidar';
import {AppDispatch} from '@redux/store';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

let watcher: FSWatcher;

export function monitorKubeConfig(filePath: string, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  watcher = watch(filePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
    ignoreInitial: true,
  });

  watcher.on('all', () => {
    dispatch(loadContexts(filePath));
  });

  watcher
    /* eslint-disable no-console */
    .on('error', error => console.log(`Watcher error: ${error}`));
}
