import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const remotePath = await getGitRemotePath({path: 'some/path'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getGitRemotePath = invokeIpc<GitPathParams, string>('git:getGitRemotePath');
