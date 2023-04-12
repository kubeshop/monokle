import {invokeIpc} from '@utils/ipc';

import {GitBranchCommitsParams, GitBranchCommitsResult} from '@shared/ipc/git';

export const getBranchCommits = invokeIpc<GitBranchCommitsParams, GitBranchCommitsResult>('git:getBranchCommits');
