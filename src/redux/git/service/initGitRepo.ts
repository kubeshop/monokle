import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await initGitRepo({path: 'path/to/repo'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const initGitRepo = invokeIpc<GitPathParams, void>('git:initGitRepo');
