import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await fetchRepo({path: 'some/path'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const fetchRepo = invokeIpc<GitPathParams, void>('git:fetchRepo');
