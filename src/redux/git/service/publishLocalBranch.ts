import {invokeIpc} from '@utils/ipc';

import {GitPublishLocalBranchParams} from '@shared/ipc/git';

export const publishLocalBranch = invokeIpc<GitPublishLocalBranchParams, void>('git:publishLocalBranch');
