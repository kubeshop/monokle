import simpleGit from 'simple-git';

import type {GitPushChangesParams} from '@shared/ipc/git';
import {trackEvent} from '@shared/utils/telemetry';

export async function pushChanges({branchName, localPath}: GitPushChangesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  await git.push('origin', branchName);
  trackEvent('git/push');
}
