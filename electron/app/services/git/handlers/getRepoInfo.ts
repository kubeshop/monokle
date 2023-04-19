import {orderBy} from 'lodash';
import simpleGit from 'simple-git';

import {GitPathParams} from '@shared/ipc';
import type {GitRepo} from '@shared/models/git';

import {getAheadBehindCommitsCount} from './getAheadBehindCommitsCount';

async function getGitRemoteUrl(path: string) {
  const git = simpleGit({baseDir: path});

  const result = await git.raw('config', '--get', 'remote.origin.url');
  return result;
}

export async function getRepoInfo({path}: GitPathParams): Promise<GitRepo> {
  const git = simpleGit({baseDir: path});

  let gitRepo: GitRepo;

  const [remoteBranchSummary, localBranches, remoteUrl] = await Promise.all([
    git.branch({'-r': null}),
    git.branchLocal(),
    getGitRemoteUrl(path),
  ]);

  gitRepo = {
    branches: [...localBranches.all, ...remoteBranchSummary.all],
    currentBranch: localBranches.current || remoteBranchSummary.current,
    branchMap: {},
    commits: {ahead: 0, behind: 0},
    remoteRepo: {exists: false, authRequired: false},
  };

  if (typeof remoteUrl === 'string') {
    gitRepo.remoteUrl = remoteUrl.replaceAll('.git', '');
  }

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

  const branchMapValues = Object.values(gitRepo.branchMap);

  for (let i = 0; i < branchMapValues.length; i += 1) {
    const branchName = branchMapValues[i].name;

    // get the list of commits for each branch found
    const commits = [...(await git.log({[branchName === gitRepo.currentBranch ? '.' : branchName]: null})).all];

    branchMapValues[i].commits = orderBy(commits, ['date'], ['desc']);
  }

  try {
    await git.remote(['show', 'origin']);
    gitRepo.remoteRepo = {exists: true, authRequired: false};
  } catch (e: any) {
    if (e.message.includes('Authentication failed')) {
      gitRepo.remoteRepo = {
        exists: true,
        authRequired: true,
        errorMessage: e.message.split('fatal: ').pop().replaceAll("'", ''),
      };
    }
  }

  try {
    const {aheadCount, behindCount} = await getAheadBehindCommitsCount({
      localPath: path,
      branchName: gitRepo.currentBranch,
    });
    gitRepo.commits.ahead = aheadCount;
    gitRepo.commits.behind = behindCount;
  } catch (e) {
    return gitRepo;
  }

  return gitRepo;
}
