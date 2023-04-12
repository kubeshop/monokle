import simpleGit from 'simple-git';

import type {GitCheckoutBranchParams} from '@shared/ipc/git';
import {trackEvent} from '@shared/utils/telemetry';

export async function checkoutGitBranch({branchName, localPath}: GitCheckoutBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});
  await git.checkout(branchName);
  trackEvent('git/branch_checkout');
}
