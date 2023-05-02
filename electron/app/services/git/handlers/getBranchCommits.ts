import {orderBy} from 'lodash';
import simpleGit from 'simple-git';

import type {GitBranchCommitsParams, GitBranchCommitsResult} from '@shared/ipc/git';

export async function getBranchCommits({
  branchName,
  localPath,
}: GitBranchCommitsParams): Promise<GitBranchCommitsResult> {
  const git = simpleGit({baseDir: localPath});

  const commits = [...(await git.log({[branchName]: null})).all];
  return orderBy(commits, ['date'], ['desc']);
}
