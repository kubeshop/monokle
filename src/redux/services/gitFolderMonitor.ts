import {FSWatcher, watch} from 'chokidar';
import {sep} from 'path';

import {updateProjectsGitRepo} from '@redux/appConfig';
import {setBranchCommits, setChangedFiles, setCommits, setRepo} from '@redux/git';

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

      // commit was made/undoed or push was made
      if (path.startsWith(`${absolutePath}${sep}logs${sep}refs`)) {
        const branchName = path.includes('heads') ? gitRepo.currentBranch : `origin/${gitRepo.currentBranch}`;

        promiseFromIpcRenderer('git.getCommitsCount', 'git.getCommitsCount.result', {
          localPath: rootFolderPath,
          branchName: gitRepo.currentBranch,
        }).then(commits => {
          thunkAPI.dispatch(
            setCommits({ahead: parseInt(commits.aheadCommits, 10), behind: parseInt(commits.behindCommits, 10)})
          );
        });

        promiseFromIpcRenderer('git.getBranchCommits', 'git.getBranchCommits.result', {
          localPath: rootFolderPath,
          branchName,
        }).then(commits => {
          thunkAPI.dispatch(setBranchCommits({branchName, commits}));
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
