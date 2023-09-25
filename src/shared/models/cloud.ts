import {ProjectInfo} from '@monokle/synchronizer';

/**
 * This type is used by the renderer so it doesn't need to have all the properties of the User class
 */
export type CloudUser = {
  readonly email: string;
};

export type CloudLoginResponse = {
  user: CloudUser;
};

export type CloudPolicyInfo = {
  link: string;
};

export type CloudState = {
  user?: CloudUser;
  projectInfo?: ProjectInfo;
  policyInfo?: CloudPolicyInfo;
};
