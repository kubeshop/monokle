import {FSWatcher, watch} from 'chokidar';
import log from 'loglevel';
import {sep} from 'path';

import {updateProjectsGitRepo} from '@redux/appConfig';
import {setBranchCommits, setChangedFiles, setCommits, setRepo} from '@redux/git';
import {isFolderGitRepo} from '@redux/git/service';

import {promiseFromIpcRenderer} from '@utils/promises';
import {showGitErrorModal} from '@utils/terminal';

let watcher: FSWatcher;

/**
 * Creates a monitor for .git folder
 */

export async function monitorGitFolder(rootFolderPath: string | null, thunkAPI: any) {
  if (!rootFolderPath) {
    return;
  }

  let isGitRepo: boolean;

  try {
    isGitRepo = await isFolderGitRepo({path: rootFolderPath});
  } catch (err) {
    isGitRepo = false;
  }

  if (!isGitRepo) {
    return;
  }

  if (watcher) {
    watcher.close();
  }

  const result = await promiseFromIpcRenderer('git.getRemotePath', 'git.getRemotePath.result', rootFolderPath);

  if (result.error) {
    showGitErrorModal('Failed to get remote!', 'git rev-parse --show-toplevel', thunkAPI.dispatch);
    return;
  }

  const absolutePath = `${result.replaceAll('/', sep)}${sep}.git`;

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
      const rootFolder = thunkAPI.getState().config.selectedProjectRootFolder;
      const repo = thunkAPI.getState().git.repo;

      try {
        isFolderGitRepo({path: rootFolder}).then(isRepo => {
          if (!isRepo && repo) {
            thunkAPI.dispatch(setChangedFiles([]));
            thunkAPI.dispatch(setRepo(undefined));
            thunkAPI.dispatch(updateProjectsGitRepo([{path: rootFolderPath || '', isGitRepo: false}]));
          }
        });
      } catch (err) {
        log.error(err);
      }
    });
}
