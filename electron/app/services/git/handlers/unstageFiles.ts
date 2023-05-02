import simpleGit from 'simple-git';

import type {GitStageUnstageFilesParams} from '@shared/ipc/git';

export async function unstageFiles({filePaths, localPath}: GitStageUnstageFilesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  const unstageProperties = filePaths.reduce((prev, current) => {
    return {...prev, [current]: null};
  }, {} as any);

  await git.reset({'-q': null, HEAD: null, '--': null, ...unstageProperties});
}
