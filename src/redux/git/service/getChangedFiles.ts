import {invokeIpc} from '@utils/ipc';

import {GitChangedFilesParams} from '@shared/ipc/git';
import {GitChangedFile} from '@shared/models/git';

export const getChangedFiles = invokeIpc<GitChangedFilesParams, GitChangedFile[]>('git:getChangedFiles');
