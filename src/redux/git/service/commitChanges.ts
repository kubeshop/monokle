import {invokeIpc} from '@utils/ipc';

import {GitCommitChangesParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await commitChanges({localPath: 'some/path', message: 'some message'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const commitChanges = invokeIpc<GitCommitChangesParams, void>('git:commitChanges');
