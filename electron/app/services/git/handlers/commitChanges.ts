import simpleGit from 'simple-git';

import type {GitCommitChangesParams} from '@shared/ipc/git';
import {trackEvent} from '@shared/utils/telemetry';

export async function commitChanges({localPath, message}: GitCommitChangesParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});
  await git.commit(message);
  trackEvent('git/commit');
}
