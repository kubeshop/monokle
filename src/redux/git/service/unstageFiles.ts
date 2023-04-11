import {invokeIpc} from '@utils/ipc';

import {GitStageUnstageFilesParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await unstageFiles({localPath: 'path/to/repo', filePaths: ['some/file/path', 'some/other/file/path']});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const unstageFiles = invokeIpc<GitStageUnstageFilesParams, void>('git:unstageFiles');
