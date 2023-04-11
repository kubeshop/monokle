import simpleGit from 'simple-git';

import {GitPathParams} from '@shared/ipc';

export async function initGitRepo({path}: GitPathParams): Promise<void> {
  const git = simpleGit({baseDir: path});

  try {
    await git.init();
    await git.commit('Initial commit', undefined, {'--allow-empty': null});
  } catch (e: any) {
    throw new Error(e.message);
  }
}
