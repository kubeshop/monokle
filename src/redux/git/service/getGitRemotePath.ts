import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';

export const getGitRemotePath = invokeIpc<GitPathParams, string>('git:getGitRemotePath');
