import simpleGit from 'simple-git';

import {GitPathParams} from '@shared/ipc/git';

export async function getGitRemotePath({path}: GitPathParams) {
  const git = simpleGit({baseDir: path});

  try {
    const gitFolderPath = await git.revparse({'--show-toplevel': null});
    return gitFolderPath;
  } catch (e: any) {
    return new Error(e.message);
  }
}
