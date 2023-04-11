import {invokeIpc} from '@utils/ipc';

import {GitSetRemoteParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await setRemote({localPath: 'path/to/repo', remoteURL: 'some remote URL'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const setRemote = invokeIpc<GitSetRemoteParams, void>('git:setRemote');
