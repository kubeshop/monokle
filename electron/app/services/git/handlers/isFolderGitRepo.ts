import {existsSync} from 'fs';
import simpleGit from 'simple-git';

import {GitPathParams} from '@shared/ipc/git';

export async function isFolderGitRepo({path}: GitPathParams): Promise<boolean> {
  if (!existsSync(path)) {
    return false;
  }

  const git = simpleGit({baseDir: path});

  try {
    await git.status();
    return true;
  } catch (e) {
    return false;
  }
}
