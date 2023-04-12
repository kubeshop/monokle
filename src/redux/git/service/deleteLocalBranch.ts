import {invokeIpc} from '@utils/ipc';

import {GitCreateDeleteLocalBranchParams} from '@shared/ipc/git';

export const deleteLocalBranch = invokeIpc<GitCreateDeleteLocalBranchParams, void>('git:deleteLocalBranch');
