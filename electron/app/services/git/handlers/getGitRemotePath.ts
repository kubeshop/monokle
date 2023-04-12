import simpleGit from 'simple-git';

import type {GitPathParams} from '@shared/ipc/git';

export async function getGitRemotePath({path}: GitPathParams): Promise<string> {
  const git = simpleGit({baseDir: path});

  try {
    const gitFolderPath = await git.revparse({'--show-toplevel': null});
    return gitFolderPath;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
