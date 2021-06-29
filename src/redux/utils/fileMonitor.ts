import chokidar, {FSWatcher} from 'chokidar';
import {AppConfig} from '@models/appconfig';
import {AppDispatch} from '@redux/store';
import {fileAdded, fileChanged, fileRemoved} from '@redux/reducers/main';

let watcher: FSWatcher;
let initializing = false;

export function monitorRootFolder(folder: string, appConfig: AppConfig, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  initializing = true;

  console.log(`Monitoring ${folder} for changes..`);
  watcher = chokidar.watch(folder, {
    ignored: appConfig.scanExcludes,
    persistent: true,
  });

  watcher
    .on('add', path => {
      if (!initializing) {
        dispatch(fileAdded(path));
      }
    })
    .on('change', path => {
      if (!initializing) {
        dispatch(fileChanged(path));
      }
    })
    .on('unlink', path => {
      if (!initializing) {
        dispatch(fileRemoved(path));
      }
    });

  // More possible events.
  watcher
    //    .on('addDir', path => console.log(`Directory ${path} has been added`))
    //    .on('unlinkDir', path => console.log(`Directory ${path} has been removed`))
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => {
      initializing = false;
      console.log('Initial scan complete. Ready for changes');
    });
}
