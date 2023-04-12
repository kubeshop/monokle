import {invokeIpc} from '@utils/ipc';

export const isGitInstalled = invokeIpc<{}, boolean>('git:isGitInstalled');
