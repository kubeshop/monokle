import simpleGit from 'simple-git';

import {GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult} from '@shared/ipc/git';

export async function getAheadBehindCommitsCount({
  currentBranch,
  localPath,
}: GitAheadBehindCommitsCountParams): Promise<GitAheadBehindCommitsCountResult> {
  const git = simpleGit({baseDir: localPath});

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
