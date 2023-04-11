import simpleGit from 'simple-git';

import {GitPathParams} from '@shared/ipc/git';

export async function fetchRepo({path}: GitPathParams): Promise<void> {
  const git = simpleGit({baseDir: path});

  console.log('Path: ', path);

  try {
    await git.fetch();
  } catch (e: any) {
    throw new Error(e.message);
  }
}
