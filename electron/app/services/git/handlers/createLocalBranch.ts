import simpleGit from 'simple-git';

import type {GitCreateDeleteLocalBranchParams} from '@shared/ipc/git';

export async function createLocalBranch({branchName, localPath}: GitCreateDeleteLocalBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.checkoutLocalBranch(branchName);
  } catch (e: any) {
    throw new Error(e.message);
  }
}
