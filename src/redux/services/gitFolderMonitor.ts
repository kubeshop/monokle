import {FSWatcher, watch} from 'chokidar';
import {sep} from 'path';

import {setCurrentBranch, setRepo} from '@redux/git';
import {updateProjectsGitRepo} from '@redux/reducers/appConfig';

import {promiseFromIpcRenderer} from '@utils/promises';

let watcher: FSWatcher;

/**
 * Creates a monitor for .git folder
 */

export function monitorGitFolder(rootFolderPath: string | null, thunkAPI: any) {
  if (!rootFolderPath) {
    return;
  }

  if (watcher) {
    watcher.close();
  }

  const absolutePath = `${rootFolderPath}${sep}.git`;

  watcher = watch(absolutePath, {persistent: true, usePolling: true, interval: 1000});

  watcher
    .on('change', path => {
      const gitRepo = thunkAPI.getState().git.repo;

      if (!gitRepo) {
        return;
      }

      // branch was switched
      if (
        path === `${absolutePath}${sep}HEAD` ||
        path === `${absolutePath}${sep}config` ||
        path === `${absolutePath}${sep}FETCH_HEAD`
      ) {
        promiseFromIpcRenderer('git.fetchGitRepo', 'git.fetchGitRepo.result', rootFolderPath).then(result => {
          thunkAPI.dispatch(setRepo(result));
          thunkAPI.dispatch(setCurrentBranch(result.currentBranch));
        });
      }
    })
    .on('unlinkDir', () => {
      promiseFromIpcRenderer(
        'git.isFolderGitRepo',
        'git.isFolderGitRepo.result',
        thunkAPI.getState().config.selectedProjectRootFolder
      ).then(isGitRepo => {
        if (!isGitRepo && thunkAPI.getState().git.repo) {
          thunkAPI.dispatch(setRepo(undefined));
          thunkAPI.dispatch(updateProjectsGitRepo([{path: rootFolderPath || '', isGitRepo: false}]));
        }
      });
    });
}
