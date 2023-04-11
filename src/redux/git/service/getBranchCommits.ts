import {invokeIpc} from '@utils/ipc';

import {GitBranchCommitsParams, GitBranchCommitsResult} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *   const commits = await getBranchCommits({localPath: 'some/path', branchName: 'some/branch/name'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getBranchCommits = invokeIpc<GitBranchCommitsParams, GitBranchCommitsResult>('git:getBranchCommits');
