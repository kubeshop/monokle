import {invokeIpc} from '@utils/ipc';

import {GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult} from '@shared/ipc/git';

export const getAheadBehindCommitsCount = invokeIpc<GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult>(
  'git:getAheadBehindCommitsCount'
);
