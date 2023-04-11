import simpleGit from 'simple-git';

import {GitStageUnstageFilesParams} from '@shared/ipc/git';

export async function unstageFiles({filePaths, localPath}: GitStageUnstageFilesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  const unstageProperties = filePaths.reduce((prev, current) => {
    return {...prev, [current]: null};
  }, {} as any);

  try {
    await git.reset({'-q': null, HEAD: null, '--': null, ...unstageProperties});
  } catch (e: any) {
    throw new Error(e.message);
  }
}
