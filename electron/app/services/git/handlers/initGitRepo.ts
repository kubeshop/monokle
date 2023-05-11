import simpleGit from 'simple-git';

import type {GitPathParams} from '@shared/ipc/git';

export async function initGitRepo({path}: GitPathParams): Promise<void> {
  const git = simpleGit({baseDir: path});

  await git.init();
  await git.commit('Initial commit', undefined, {'--allow-empty': null});
}
