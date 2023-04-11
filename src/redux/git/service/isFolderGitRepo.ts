import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const isGitRepo = await isFolderGitRepo({path: 'path/to/repo'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const isFolderGitRepo = invokeIpc<GitPathParams, boolean>('git:isFolderGitRepo');
