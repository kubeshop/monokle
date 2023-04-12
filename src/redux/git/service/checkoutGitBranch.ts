import {invokeIpc} from '@utils/ipc';

import {GitCheckoutBranchParams} from '@shared/ipc/git';

export const checkoutGitBranch = invokeIpc<GitCheckoutBranchParams, void>('git:checkoutGitBranch');
