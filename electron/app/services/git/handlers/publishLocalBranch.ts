import simpleGit from 'simple-git';

import type {GitPublishLocalBranchParams} from '@shared/ipc/git';

export async function publishLocalBranch({branchName, localPath}: GitPublishLocalBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  await git.push({'-u': null, origin: null, [branchName]: null});
}
