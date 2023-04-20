import simpleGit from 'simple-git';

import type {GitStageUnstageFilesParams} from '@shared/ipc/git';

export async function stageChangedFiles({filePaths, localPath}: GitStageUnstageFilesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  await git.add(filePaths);
}
