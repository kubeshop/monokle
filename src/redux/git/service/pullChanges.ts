import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await pullChanges({path: 'path/to/repo'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const pullChanges = invokeIpc<GitPathParams, void>('git:pullChanges');
