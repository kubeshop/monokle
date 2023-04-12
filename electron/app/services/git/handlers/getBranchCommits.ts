import {orderBy} from 'lodash';
import simpleGit from 'simple-git';

import type {GitBranchCommitsParams, GitBranchCommitsResult} from '@shared/ipc/git';

export async function getBranchCommits({
  branchName,
  localPath,
}: GitBranchCommitsParams): Promise<GitBranchCommitsResult> {
  const git = simpleGit({baseDir: localPath});

  try {
    const commits = [...(await git.log({[branchName]: null})).all];

    return orderBy(commits, ['date'], ['desc']);
  } catch (e: any) {
    throw new Error(e.message);
  }
}
