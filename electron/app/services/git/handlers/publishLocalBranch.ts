import simpleGit from 'simple-git';

import {GitPublishLocalBranchParams} from '@shared/ipc/git';

export async function publishLocalBranch({branchName, localPath}: GitPublishLocalBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.push({'-u': null, origin: null, [branchName]: null});
  } catch (e: any) {
    throw new Error(e.message);
  }
}
