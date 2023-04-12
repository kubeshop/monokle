import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

export const fetchRepo = invokeIpc<GitPathParams, void>('git:fetchRepo');
