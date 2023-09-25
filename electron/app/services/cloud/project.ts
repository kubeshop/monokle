import {ProjectInfo} from '@monokle/synchronizer';
import {CloudPolicyInfo} from '@shared/models/cloud';

import {getSynchronizer} from './synchronizer';
import {getUser} from './user';

export const getInfo = async (
  repoPath: string
): Promise<{projectInfo: ProjectInfo; policyInfo: CloudPolicyInfo} | null> => {
  const synchronizer = await getSynchronizer();
  const user = await getUser();
  if (!user?.token || !synchronizer) {
    return null;
  }

  try {
    const project = await synchronizer?.getProjectInfo(repoPath, user.token, true);
    return project
      ? {projectInfo: project, policyInfo: {link: synchronizer.generateDeepLinkProjectPolicy(project.slug)}}
      : null;
  } catch {
    return null;
  }
};
