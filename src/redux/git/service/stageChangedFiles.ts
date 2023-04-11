import {invokeIpc} from '@utils/ipc';

import {GitStageChangedFilesParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await stageChangedFiles({localPath: 'path/to/repo', filePaths: ['some/file/path', 'some/other/file/path']});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const stageChangedFiles = invokeIpc<GitStageChangedFilesParams, void>('git:stageChangedFiles');
