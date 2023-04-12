import {invokeIpc} from '@utils/ipc';

import {GitPathParams} from '@shared/ipc/git';
import {GitRepo} from '@shared/models/git';

export const getRepoInfo = invokeIpc<GitPathParams, GitRepo>('git:getRepoInfo');
