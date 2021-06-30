import chokidar, {FSWatcher} from 'chokidar';
import {AppConfig} from '@models/appconfig';
import {AppDispatch} from '@redux/store';
import {fileChanged, pathAdded, pathRemoved} from '@redux/reducers/main';

let watcher: FSWatcher;
let initializing = false;

export function monitorRootFolder(folder: string, appConfig: AppConfig, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  initializing = true;
  watcher = chokidar.watch(folder, {
    ignored: appConfig.scanExcludes,
    persistent: true,
  });

  watcher
    .on('add', path => {
      if (!initializing) {
        dispatch(pathAdded(path));
      }
    })
    .on('addDir', path => {
      if (!initializing) {
        dispatch(pathAdded(path));
      }
    })
    .on('change', path => {
      if (!initializing) {
        dispatch(fileChanged(path));
      }
    })
    .on('unlink', path => {
      if (!initializing) {
        dispatch(pathRemoved(path));
      }
    })
    .on('unlinkDir', path => {
      if (!initializing) {
        dispatch(pathRemoved(path));
      }
    });

  watcher
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => {
      initializing = false;
    });
}
