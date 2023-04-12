import {invokeIpc} from '@utils/ipc';

import {GitCommitResourcesParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const filesContent = await getCommitResources({localPath: 'some/path', commitHash: 'some commit hash'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getCommitResources = invokeIpc<GitCommitResourcesParams, Record<string, string>>('git:getCommitResources');
