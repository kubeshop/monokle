import {watch, FSWatcher} from 'chokidar';
import {AppDispatch} from '@redux/store';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

let watcher: FSWatcher;
let initializing = false;

export function monitorKubeConfig(filePath: string, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  initializing = true;
  watcher = watch(filePath, {
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher.on('all', () => {
    if (!initializing) {
      dispatch(loadContexts(filePath));
    }
  });

  watcher
    /* eslint-disable no-console */
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => {
      initializing = false;
    });
}
