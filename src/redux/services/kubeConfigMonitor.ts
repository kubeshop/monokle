import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';

import {AppDispatch} from '@redux/store';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

let watcher: FSWatcher;

export async function monitorKubeConfig(filePath: string, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.isFile()) {
      watcher = watch(filePath, {
        persistent: true,
        usePolling: true,
        interval: 1000,
        ignoreInitial: true,
      });

      watcher.on('all', (type: string) => {
        if (type === 'unlink') {
          watcher.close();
          dispatch(loadContexts(''));
          return;
        }
        dispatch(loadContexts(filePath));
      });
    }
  } catch (e) {
    //
  }
}
