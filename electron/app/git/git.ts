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
  const remoteBranchSummary = await git.branch({'-r': null});
  const localBranches = await git.branchLocal();

  const gitRepo: GitRepo = {
    branches: [...localBranches.all, ...remoteBranchSummary.all],
    currentBranch: localBranches.current || remoteBranchSummary.current,
    branchMap: {},
  };

  gitRepo.branchMap = Object.fromEntries(
    Object.entries({...localBranches.branches}).map(([key, value]) => [
      key,
      {name: value.name, commitSha: value.commit, type: 'local'},
    ])
  );

  gitRepo.branchMap = {
    ...gitRepo.branchMap,
    ...Object.fromEntries(
      Object.entries({...remoteBranchSummary.branches}).map(([key, value]) => [
        key,
        {name: value.name.replace('remotes/', ''), commitSha: value.commit, type: 'remote'},
      ])
    ),
  };

  return gitRepo;
}

export async function checkoutGitBranch(payload: {localPath: string; branchName: string}) {
  const {localPath, branchName} = payload;
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.checkout(branchName);
}
