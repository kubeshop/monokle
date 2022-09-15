import {FSWatcher, watch} from 'chokidar';
import {sep} from 'path';

import {setChangedFiles, setCurrentBranch, setRepo} from '@redux/git';
import {updateProjectsGitRepo} from '@redux/reducers/appConfig';

import {promiseFromIpcRenderer} from '@utils/promises';

let headWatcher: FSWatcher;
let objectsWatcher: FSWatcher;

/**
 * Creates a monitor for .git folder
 */

export function monitorGitFolder(rootFolderPath: string | null, thunkAPI: any) {
  if (!rootFolderPath) {
    return;
  }

  if (headWatcher) {
    headWatcher.close();
  }

  if (objectsWatcher) {
    objectsWatcher.close();
  }

  const headAbsolutePath = `${rootFolderPath}${sep}.git${sep}HEAD`;
  const objectsAbsolutePath = `${rootFolderPath}${sep}.git${sep}objects`;

  headWatcher = watch(headAbsolutePath, {persistent: true, usePolling: true, interval: 1000});
  objectsWatcher = watch(objectsAbsolutePath, {persistent: true, usePolling: true, interval: 1000});

  headWatcher
    .on('change', () => {
      const gitRepo = thunkAPI.getState().git.repo;

      if (gitRepo) {
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

  objectsWatcher.on('change', () => {
    const gitRepo = thunkAPI.getState().git.repo;

    if (gitRepo) {
      promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
        localPath: rootFolderPath,
        fileMap: thunkAPI.getState().main.fileMap,
      }).then(result => {
        thunkAPI.dispatch(setChangedFiles(result));
      });
    }
  });
}
