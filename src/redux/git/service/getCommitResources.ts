import {invokeIpc} from '@utils/ipc';

import {GitCommitResourcesParams} from '@shared/ipc/git';

export const getCommitResources = invokeIpc<GitCommitResourcesParams, Record<string, string>>('git:getCommitResources');
