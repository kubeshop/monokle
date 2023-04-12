import simpleGit from 'simple-git';

import type {GitPushChangesParams} from '@shared/ipc/git';
import {trackEvent} from '@shared/utils/telemetry';

export async function pushChanges({branchName, localPath}: GitPushChangesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.push('origin', branchName);
    trackEvent('git/push');
  } catch (e: any) {
    throw new Error(e.message);
  }
}
