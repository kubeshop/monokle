import {invokeIpc} from '@utils/ipc';

import {GitPushChangesParams} from '@shared/ipc';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await pushChanges({localPath: 'path/to/repo', branchName: "someBranchName"});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const pushChanges = invokeIpc<GitPushChangesParams, void>('git:pushChanges');
