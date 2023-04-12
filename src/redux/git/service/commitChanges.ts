import {invokeIpc} from '@utils/ipc';

import {GitCommitChangesParams} from '@shared/ipc/git';

export const commitChanges = invokeIpc<GitCommitChangesParams, void>('git:commitChanges');
