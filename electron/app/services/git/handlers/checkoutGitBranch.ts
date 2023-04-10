import simpleGit from 'simple-git';

import {GitCheckoutBranchParams} from '@shared/ipc/git';
import {trackEvent} from '@shared/utils/telemetry';

export async function checkoutGitBranch({branchName, localPath}: GitCheckoutBranchParams): Promise<void> {
  const git = simpleGit({baseDir: localPath});

  try {
    await git.checkout(branchName);
    trackEvent('git/branch_checkout');
  } catch (e: any) {
    throw new Error(e.message);
  }
}
