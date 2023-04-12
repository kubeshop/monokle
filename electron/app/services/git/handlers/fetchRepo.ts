import simpleGit from 'simple-git';

import type {GitPathParams} from '@shared/ipc/git';

export async function fetchRepo({path}: GitPathParams): Promise<void> {
  const git = simpleGit({baseDir: path});
  await git.fetch();
}
