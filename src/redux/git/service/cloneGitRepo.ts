import {invokeIpc} from '@utils/ipc';

import {GitCloneRepoParams} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   await cloneGitRepo({localPath: 'some/path', repoPath: 'some/repo/path'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const cloneGitRepo = invokeIpc<GitCloneRepoParams, void>('git:cloneGitRepo');
