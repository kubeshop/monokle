import {invokeIpc} from '@utils/ipc';

import {GitSetRemoteParams} from '@shared/ipc/git';

export const setRemote = invokeIpc<GitSetRemoteParams, void>('git:setRemote');
