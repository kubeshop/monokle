import simpleGit from 'simple-git';

import {GitStageUnstageFilesParams} from '@shared/ipc/git';

export async function stageChangedFiles({filePaths, localPath}: GitStageUnstageFilesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.add(filePaths);
  } catch (e: any) {
    throw new Error(e.message);
  }
}
