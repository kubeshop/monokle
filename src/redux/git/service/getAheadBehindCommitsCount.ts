import {invokeIpc} from '@utils/ipc';

import {GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult} from '@shared/ipc/git';

/**
 * Example usage:
 *
 * ```
 * try {
 *  const {aheadCount, behindCount} = await getAheadBehindCommitsCount({localPath: 'some/local/path', branchName: 'some/branch/name'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getAheadBehindCommitsCount = invokeIpc<GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult>(
  'git:getAheadBehindCommitsCount'
);
