import {invokeIpc} from '@utils/ipc';

import {GitChangedFilesParams} from '@shared/ipc/git';
import {GitChangedFile} from '@shared/models/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const changedFiles = await getChangedFiles({localPath: 'some/path', fileMap: {...}});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getChangedFiles = invokeIpc<GitChangedFilesParams, GitChangedFile[]>('git:getChangedFiles');
