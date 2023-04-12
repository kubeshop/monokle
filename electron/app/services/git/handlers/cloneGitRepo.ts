import {promises as fs} from 'fs';
import simpleGit from 'simple-git';

import type {GitCloneRepoParams} from '@shared/ipc/git';

export async function cloneGitRepo({localPath, repoPath}: GitCloneRepoParams): Promise<void> {
  try {
    const stat = await fs.stat(localPath);

    if (!stat.isDirectory()) {
      throw new Error(`${localPath} is not a directory`);
    }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      await fs.mkdir(localPath);
    } else {
      throw new Error(e.message);
    }
  }

  const git = simpleGit({baseDir: localPath});
  await git.clone(repoPath, localPath);
}
