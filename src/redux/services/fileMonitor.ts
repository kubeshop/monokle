import {FSWatcher, watch} from 'chokidar';

import {AppConfig} from '@models/appconfig';
import {AppDispatch} from '@models/appdispatch';

import {multipleFilesChanged, multiplePathsAdded, multiplePathsRemoved} from '@redux/reducers/main';

import {debounceWithPreviousArgs} from '@utils/helpers';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorRootFolder(folder: string, appConfig: AppConfig, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  const scanExcludes = appConfig.projectConfig?.scanExcludes || appConfig.scanExcludes;

  watcher = watch(folder, {
    ignored: scanExcludes,
    ignoreInitial: true,
    persistent: true,
    usePolling: true,
    interval: 1000,
  });

  watcher
    .on(
      'add',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsAdded({paths, appConfig}));
      }, 1000)
    )
    .on(
      'addDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsAdded({paths, appConfig}));
      }, 1000)
    )
    .on(
      'change',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multipleFilesChanged({paths, appConfig}));
      }, 1000)
    )
    .on(
      'unlink',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsRemoved(paths));
      }, 1000)
    )
    .on(
      'unlinkDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsRemoved(paths));
      }, 1000)
    );

  watcher
    /* eslint-disable no-console */
    .on('error', error => console.log(`Watcher error: ${error}`));
}
