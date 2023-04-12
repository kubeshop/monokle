import simpleGit from 'simple-git';

import type {GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult} from '@shared/ipc/git';

export async function getAheadBehindCommitsCount({
  branchName,
  localPath,
}: GitAheadBehindCommitsCountParams): Promise<GitAheadBehindCommitsCountResult> {
  const git = simpleGit({baseDir: localPath});

  try {
    const [aheadCommits, behindCommits] = (
      await git.raw('rev-list', '--left-right', '--count', `${branchName}...origin/${branchName}`)
    )
      .trim()
      .split('\t');

    return {aheadCount: parseInt(aheadCommits, 10), behindCount: parseInt(behindCommits, 10)};
  } catch (e: any) {
    throw new Error(e.message);
  }
}
