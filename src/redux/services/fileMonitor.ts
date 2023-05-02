import {FSWatcher, watch} from 'chokidar';
import log from 'loglevel';

import {setChangedFiles, setCurrentBranch, setGitLoading, setRepo} from '@redux/git';
import {getChangedFiles, getRepoInfo} from '@redux/git/git.ipc';
import {multiplePathsRemoved} from '@redux/reducers/main';
import {multiplePathsAdded} from '@redux/thunks/multiplePathsAdded';
import {multiplePathsChanged} from '@redux/thunks/multiplePathsChanged';

import {filterGitFolder} from '@utils/git';
import {showGitErrorModal} from '@utils/terminal';

import {debounceWithPreviousArgs} from '@shared/utils/watch';

let watcher: FSWatcher;

/**
 * Creates a monitor for the specified folder and dispatches folder events using the specified dispatch
 */

export function monitorRootFolder(folder: string, thunkAPI: {getState: Function; dispatch: Function}) {
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
        thunkAPI.dispatch(multiplePathsAdded(filterGitFolder(paths)));
      }, 1000)
    )
    .on(
      'addDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsAdded(filterGitFolder(paths)));
      }, 1000)
    )
    .on(
      'change',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsChanged(filterGitFolder(paths)));
      }, 1000)
    )
    .on(
      'unlink',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsRemoved(filterGitFolder(paths)));

        if (!thunkAPI.getState().git.repo) {
          return;
        }

        getRepoInfo({path: folder})
          .then(repo => {
            if (!thunkAPI.getState().git.loading) {
              thunkAPI.dispatch(setGitLoading(true));
            }

            thunkAPI.dispatch(setRepo(repo));
            thunkAPI.dispatch(setCurrentBranch(repo.currentBranch));

            getChangedFiles({localPath: folder, fileMap: thunkAPI.getState().main.fileMap})
              .then(changedFiles => {
                thunkAPI.dispatch(setChangedFiles(changedFiles));
                thunkAPI.dispatch(setGitLoading(false));
              })
              .catch(() => {
                thunkAPI.dispatch(setGitLoading(false));
              });
          })
          .catch((err: any) => {
            showGitErrorModal('Git repository error', err.message);
            thunkAPI.dispatch(setRepo(undefined));
          });
      }, 1000)
    )
    .on(
      'unlinkDir',
      debounceWithPreviousArgs((args: any[]) => {
        const paths: Array<string> = args.map(arg => arg[0]);
        thunkAPI.dispatch(multiplePathsRemoved(filterGitFolder(paths)));

        if (!thunkAPI.getState().git.repo) {
          return;
        }

        getRepoInfo({path: folder})
          .then(repo => {
            if (!thunkAPI.getState().git.loading) {
              thunkAPI.dispatch(setGitLoading(true));
            }

            thunkAPI.dispatch(setRepo(repo));
            thunkAPI.dispatch(setCurrentBranch(repo.currentBranch));

            getChangedFiles({localPath: folder, fileMap: thunkAPI.getState().main.fileMap})
              .then(changedFiles => {
                thunkAPI.dispatch(setChangedFiles(changedFiles));
                thunkAPI.dispatch(setGitLoading(false));
              })
              .catch(() => {
                thunkAPI.dispatch(setGitLoading(false));
              });
          })
          .catch((err: any) => {
            showGitErrorModal('Git repository error', err.message);
            thunkAPI.dispatch(setRepo(undefined));
          });
      }, 1000)
    );

  watcher.on('error', error => log.error(`Watcher error: ${error}`));
}
