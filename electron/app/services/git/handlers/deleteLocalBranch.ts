import simpleGit from 'simple-git';

import type {GitCreateDeleteLocalBranchParams} from '@shared/ipc/git';

export async function deleteLocalBranch({branchName, localPath}: GitCreateDeleteLocalBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});
  await git.deleteLocalBranch(branchName);
}
