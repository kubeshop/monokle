import {invokeIpc} from '@utils/ipc';

import {GitStageUnstageFilesParams} from '@shared/ipc/git';

export const stageChangedFiles = invokeIpc<GitStageUnstageFilesParams, void>('git:stageChangedFiles');
