import simpleGit from 'simple-git';

import type {GitPathParams} from '@shared/ipc/git';

export async function getGitRemotePath({path}: GitPathParams): Promise<string> {
  const git = simpleGit({baseDir: path});

  const gitFolderPath = await git.revparse({'--show-toplevel': null});
  return gitFolderPath;
}
