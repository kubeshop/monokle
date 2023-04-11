import simpleGit from 'simple-git';

import {GitPathParams} from '@shared/ipc/git';

export async function pullChanges({path}: GitPathParams): Promise<void> {
  const git = simpleGit({baseDir: path});

  try {
    await git.pull();
  } catch (e: any) {
    throw new Error(e.message);
  }
}
