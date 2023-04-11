import {invokeIpc} from '@utils/ipc';

import {GitCheckoutBranchParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await checkoutGitBranch({localPath: 'some/path', branchName: 'someBranchName'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const checkoutGitBranch = invokeIpc<GitCheckoutBranchParams, void>('git:checkoutGitBranch');
