import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';
import {GitRepo} from '@shared/models/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const repo = await getRepoInfo({path: 'some/path'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getRepoInfo = invokeIpc<GitPathParams, GitRepo>('git:getRepoInfo');
