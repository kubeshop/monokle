import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

export const pullChanges = invokeIpc<GitPathParams, void>('git:pullChanges');
