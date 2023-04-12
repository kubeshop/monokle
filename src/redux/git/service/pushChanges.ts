import {invokeIpc} from '@utils/ipc';

import {GitPushChangesParams} from '@shared/ipc/git';

export const pushChanges = invokeIpc<GitPushChangesParams, void>('git:pushChanges');
