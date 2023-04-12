import {invokeIpc} from '@utils/ipc';

import {GitCreateDeleteLocalBranchParams} from '@shared/ipc/git';

export const createLocalBranch = invokeIpc<GitCreateDeleteLocalBranchParams, void>('git:createLocalBranch');
