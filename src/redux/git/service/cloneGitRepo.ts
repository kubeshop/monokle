import {invokeIpc} from '@utils/ipc';

import {GitCloneRepoParams} from '@shared/ipc/git';

export const cloneGitRepo = invokeIpc<GitCloneRepoParams, void>('git:cloneGitRepo');
