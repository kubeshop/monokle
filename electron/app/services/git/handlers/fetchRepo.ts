import simpleGit from 'simple-git';

import type {GitPathParams} from '@shared/ipc/git';

export async function fetchRepo({path}: GitPathParams): Promise<void> {
  const git = simpleGit({baseDir: path});

  try {
    await git.fetch();
  } catch (e: any) {
    throw new Error(e.message);
  }
}
