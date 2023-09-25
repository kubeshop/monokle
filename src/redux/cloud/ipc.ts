import {invokeIpc} from '@utils/ipc';

import type {PolicyData, ProjectInfo} from '@monokle/synchronizer';
import {CloudLoginResponse, CloudPolicyInfo, CloudUser} from '@shared/models/cloud';

export const startCloudLogin = invokeIpc<undefined, CloudLoginResponse>('cloud:login');
export const logoutFromCloud = invokeIpc<undefined, void>('cloud:logout');
export const getCloudUser = invokeIpc<undefined, CloudUser>('cloud:getUser');
export const getCloudPolicy = invokeIpc<string, PolicyData | null>('cloud:getPolicy');
export const getCloudInfo = invokeIpc<string, {projectInfo: ProjectInfo; policyInfo: CloudPolicyInfo} | null>(
  'cloud:getInfo'
);
