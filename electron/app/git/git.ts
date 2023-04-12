import {orderBy} from 'lodash';
import {SimpleGit, simpleGit} from 'simple-git';

import type {GitRepo} from '@shared/models/git';

export async function getGitRemoteUrl(path: string) {
  const git: SimpleGit = simpleGit({baseDir: path});

  try {
    const result = await git.raw('config', '--get', 'remote.origin.url');
    return result;
  } catch (e: any) {
    return {error: e.message};
  }
}

export async function getAheadBehindCommitsCount(localPath: string, currentBranch: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  try {
    const [aheadCommits, behindCommits] = (
      await git.raw('rev-list', '--left-right', '--count', `${currentBranch}...origin/${currentBranch}`)
    )
      .trim()
      .split('\t');

    return {aheadCount: parseInt(aheadCommits, 10), behindCount: parseInt(behindCommits, 10)};
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export async function getGitRepoInfo(localPath: string) {
  const git: SimpleGit = simpleGit({baseDir: localPath});

  let gitRepo: GitRepo;

  try {
    const [remoteBranchSummary, localBranches, remoteUrl] = await Promise.all([
      git.branch({'-r': null}),
      git.branchLocal(),
      getGitRemoteUrl(localPath),
    ]);

    console.log('remoteBranchSummary', remoteBranchSummary);
    console.log('localBranches', localBranches);
    console.log('remoteUrl', remoteUrl);
  } catch (e: any) {
    throw new Error(e.message);
  }

  try {
    const remoteBranchSummary = await git.branch({'-r': null});
    const localBranches = await git.branchLocal();
    const remoteUrl = await getGitRemoteUrl(localPath);

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
  } catch (e) {
    return undefined;
  }

  const branchMapValues = Object.values(gitRepo.branchMap);

  for (let i = 0; i < branchMapValues.length; i += 1) {
    const branchName = branchMapValues[i].name;

    // get the list of commits for each branch found
    const commits = [
      // eslint-disable-next-line no-await-in-loop
      ...(await git.log({[branchName]: null})).all,
    ];

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
    const {aheadCount, behindCount} = await getAheadBehindCommitsCount(localPath, gitRepo.currentBranch);
    gitRepo.commits.ahead = aheadCount;
    gitRepo.commits.behind = behindCount;
  } catch (e) {
    return gitRepo;
  }

  return gitRepo;
}
