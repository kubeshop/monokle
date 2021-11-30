import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';
import {AnyAction} from 'redux';

import {loadContexts} from '@redux/thunks/loadKubeConfig';

let watcher: FSWatcher;

export async function monitorKubeConfig(filePath: string, dispatch: (action: AnyAction) => void) {
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
          loadContexts('', dispatch);
          return;
        }
        loadContexts(filePath, dispatch);
      });
    }
  } catch (e) {
    //
  }
}
