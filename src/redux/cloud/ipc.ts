import {invokeIpc} from '@utils/ipc';

import type {PolicyData} from '@monokle/synchronizer';
import {CloudLoginResponse, CloudUser} from '@shared/models/cloud';

export const startCloudLogin = invokeIpc<undefined, CloudLoginResponse>('cloud:login');
export const getCloudUser = invokeIpc<undefined, CloudUser>('cloud:getUser');
export const getCloudPolicy = invokeIpc<string, PolicyData>('cloud:getPolicy');
