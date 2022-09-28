import {FSWatcher, watch} from 'chokidar';
import log from 'loglevel';

import {AppDispatch} from '@models/appdispatch';

import {setCurrentBranch, setRepo} from '@redux/git';
import {multiplePathsRemoved} from '@redux/reducers/main';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';

import {filterGitFolder} from '@utils/git';
import {debounceWithPreviousArgs} from '@utils/helpers';
import {promiseFromIpcRenderer} from '@utils/promises';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorRootFolder(folder: string, dispatch: AppDispatch) {
  if (watcher) {
    watcher.close();
  }

  watcher = watch(folder, {
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
        dispatch(multiplePathsAdded(filterGitFolder(paths)));
      }, 1000)
    )
    .on(
      'addDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsAdded(filterGitFolder(paths)));
      }, 1000)
    )
    .on(
      'change',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsChanged(filterGitFolder(paths)));
      }, 1000)
    )
    .on(
      'unlink',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsRemoved(filterGitFolder(paths)));

        promiseFromIpcRenderer('git.fetchGitRepo', 'git.fetchGitRepo.result', folder).then(repo => {
          if (repo) {
            dispatch(setRepo(repo));
            dispatch(setCurrentBranch(repo.currentBranch));
          }
        });
      }, 1000)
    )
    .on(
      'unlinkDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        dispatch(multiplePathsRemoved(filterGitFolder(paths)));

        promiseFromIpcRenderer('git.fetchGitRepo', 'git.fetchGitRepo.result', folder).then(repo => {
          if (repo) {
            dispatch(setRepo(repo));
            dispatch(setCurrentBranch(repo.currentBranch));
          }
        });
      }, 1000)
    );

  watcher.on('error', error => log.error(`Watcher error: ${error}`));
}
