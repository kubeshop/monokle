import simpleGit from 'simple-git';

import {GitDeleteLocalBranchParams} from '@shared/ipc/git';

export async function deleteLocalBranch({branchName, localPath}: GitDeleteLocalBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.deleteLocalBranch(branchName);
  } catch (e: any) {
    throw new Error(e.message);
  }
}
