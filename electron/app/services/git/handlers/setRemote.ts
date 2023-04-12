import simpleGit from 'simple-git';

import type {GitSetRemoteParams} from '@shared/ipc/git';

export async function setRemote({localPath, remoteURL}: GitSetRemoteParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.addRemote('origin', remoteURL);
    await git.fetch();
  } catch (e: any) {
    throw new Error(e.message);
  }
}
