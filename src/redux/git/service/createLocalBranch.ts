import {invokeIpc} from '@utils/ipc';

import {GitCreateDeleteLocalBranchParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await createLocalBranch({localPath: 'some/path', branchName: 'some/branch/name'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const createLocalBranch = invokeIpc<GitCreateDeleteLocalBranchParams, void>('git:createLocalBranch');
