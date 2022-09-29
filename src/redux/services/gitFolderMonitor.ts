import {FSWatcher, watch} from 'chokidar';
import {sep} from 'path';

import {setChangedFiles, setCurrentBranch, setRepo} from '@redux/git';
import {updateProjectsGitRepo} from '@redux/reducers/appConfig';

import {promiseFromIpcRenderer} from '@utils/promises';

let watcher: FSWatcher;

/**
 * Creates a monitor for .git folder
 */

export async function monitorGitFolder(rootFolderPath: string | null, thunkAPI: any) {
  if (!rootFolderPath) {
    return;
  }

  const isFolderGitRepo = await promiseFromIpcRenderer<boolean>(
    'git.isFolderGitRepo',
    'git.isFolderGitRepo.result',
    rootFolderPath
  );

  if (!isFolderGitRepo) {
    return;
  }

  if (watcher) {
    watcher.close();
  }

  const gitRootPath = (
    await promiseFromIpcRenderer('git.getRemotePath', 'git.getRemotePath.result', rootFolderPath)
  ).replaceAll('/', sep);

  const absolutePath = `${gitRootPath}${sep}.git`;

  watcher = watch(absolutePath, {persistent: true, usePolling: true, interval: 1000});

  watcher
    .on('change', path => {
      const gitRepo = thunkAPI.getState().git.repo;

      if (!gitRepo) {
        return;
      }

      // file was staged/unstaged
      if (path === `${absolutePath}${sep}index`) {
        promiseFromIpcRenderer('git.getChangedFiles', 'git.getChangedFiles.result', {
          localPath: rootFolderPath,
          fileMap: thunkAPI.getState().main.fileMap,
        }).then(changedFiles => {
          thunkAPI.dispatch(setChangedFiles(changedFiles));
        });
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
          thunkAPI.dispatch(setChangedFiles([]));
          thunkAPI.dispatch(setRepo(undefined));
          thunkAPI.dispatch(updateProjectsGitRepo([{path: rootFolderPath || '', isGitRepo: false}]));
        }
      });
    });
}
