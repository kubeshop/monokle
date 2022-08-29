import {promises as fs} from 'fs';
import {SimpleGit, simpleGit} from 'simple-git';

import {GitRepo} from '@models/git';

export async function isFolderGitRepo(path: string) {
  const git: SimpleGit = simpleGit({baseDir: path});
  try {
    await git.status();
    return true;
  } catch (e) {
    return false;
  }
}

export async function cloneGitRepo(payload: {localPath: string; repoPath: string}) {
  const {localPath, repoPath} = payload;
  try {
    const stat = await fs.stat(localPath);
    if (!stat.isDirectory()) {
      throw new Error(`${localPath} is ot a directory`);
    }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      fs.mkdir(localPath);
    } else {
      throw e;
    }
  }
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.clone(repoPath, localPath);
}

export async function fetchGitRepo(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});
  const branchSummary = await git.branch();

  const gitRepo: GitRepo = {
    branches: branchSummary.all,
    currentBranch: branchSummary.current,
    branchMap: Object.fromEntries(
      Object.entries(branchSummary.branches).map(([key, value]) => [key, {name: value.name, commitSha: value.commit}])
    ),
  };

  return gitRepo;
}

export async function checkoutGitBranch(payload: {localPath: string; branchName: string}) {
  const {localPath, branchName} = payload;
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.checkout(branchName);
}
