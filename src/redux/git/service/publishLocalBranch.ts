import {invokeIpc} from '@utils/ipc';

import {GitPublishLocalBranchParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await publishLocalBranch({localPath: 'some/path', branchName: 'some/branch/name'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const publishLocalBranch = invokeIpc<GitPublishLocalBranchParams, void>('git:publishLocalBranch');
