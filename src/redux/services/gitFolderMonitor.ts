import {FSWatcher, watch} from 'chokidar';
import {sep} from 'path';

import {updateProjectsGitRepo} from '@redux/appConfig';
import {setBranchCommits, setChangedFiles, setCommitsCount, setRepo} from '@redux/git';
import {
  getAheadBehindCommitsCount,
  getBranchCommits,
  getGitRemotePath,
  getRepoInfo,
  isFolderGitRepo,
} from '@redux/git/git.ipc';

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

  let absolutePath: string;

  try {
    absolutePath = await getGitRemotePath({path: rootFolderPath});
    absolutePath = `${absolutePath.replaceAll('/', sep)}`;
  } catch (e) {
    showGitErrorModal('Failed to get remote!', undefined, 'git rev-parse --show-toplevel', thunkAPI.dispatch);
    return;
  }

  if (!absolutePath) {
    return;
  }

  watcher = watch(absolutePath, {persistent: true, usePolling: true, interval: 1000});

  watcher
    .on('change', path => {
      const gitRepo = thunkAPI.getState().git.repo;

      if (!gitRepo) {
        return;
      }

      const absolutePathEndsWithGit = absolutePath.endsWith(`${sep}.git`);

      if (
        path.startsWith(`${absolutePath}${absolutePathEndsWithGit ? '' : `${sep}.git`}${sep}FETCH_HEAD`) ||
        path.startsWith(`${absolutePath}${absolutePathEndsWithGit ? '' : `${sep}.git`}${sep}HEAD`)
      ) {
        getRepoInfo({path: rootFolderPath})
          .then(repo => {
            thunkAPI.dispatch(setRepo(repo));
          })
          .catch((err: any) => {
            thunkAPI.dispatch(setRepo(undefined));
            showGitErrorModal('Git repository error', err.message);
          });
      }

      // commit was made/undoed or push was made
      if (path.startsWith(`${absolutePath}${absolutePathEndsWithGit ? '' : `${sep}.git`}${sep}logs${sep}refs`)) {
        const branchName = path.includes('heads') ? gitRepo.currentBranch : `origin/${gitRepo.currentBranch}`;

        getAheadBehindCommitsCount({localPath: rootFolderPath, branchName})
          .then(({aheadCount, behindCount}) => {
            thunkAPI.dispatch(setCommitsCount({aheadCount, behindCount}));
          })
          .catch(() => {
            thunkAPI.dispatch(setCommitsCount({aheadCount: 0, behindCount: 0}));
          });

        getBranchCommits({localPath: rootFolderPath, branchName})
          .then(commits => {
            thunkAPI.dispatch(setBranchCommits({branchName, commits}));
          })
          .catch(() => {
            thunkAPI.dispatch(setBranchCommits({branchName, commits: []}));
          });
      }
    })
    .on('unlinkDir', () => {
      const rootFolder = thunkAPI.getState().config.selectedProjectRootFolder;
      const repo = thunkAPI.getState().git.repo;

      isFolderGitRepo({path: rootFolder})
        .then(isRepo => {
          if (!isRepo && repo) {
            thunkAPI.dispatch(setChangedFiles([]));
            thunkAPI.dispatch(setRepo(undefined));
            thunkAPI.dispatch(updateProjectsGitRepo([{path: rootFolderPath || '', isGitRepo: false}]));
          }
        })
        .catch(() => {
          thunkAPI.dispatch(setChangedFiles([]));
          thunkAPI.dispatch(setRepo(undefined));
          thunkAPI.dispatch(updateProjectsGitRepo([{path: rootFolderPath || '', isGitRepo: false}]));
        });
    });
}
