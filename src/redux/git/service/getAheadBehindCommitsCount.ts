import {invokeIpc} from '@utils/ipc';

import {GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult} from '@shared/ipc';

/**
 * Example usage:
 *
 * ```
 * try {
 *  const {aheadCount, behindCount} = await getAheadBehindCommitsCount({localPath: 'some/local/path', currentBranch: 'currentBranchName'});
 * } catch (err) {
 *   console.log(err);
 * }
 * ```
 */
export const getAheadBehindCommitsCount = invokeIpc<GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult>(
  'git:getAheadBehindCommitsCount'
);
