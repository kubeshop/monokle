import {v4 as uuid} from 'uuid';

import {execute} from '@shared/utils/commands';

type RestartDeploymentOptions = {
  name: string;
  namespace: string;
  currentContext: string;
  kubeConfigPath: string;
};

async function restartDeployment(options: RestartDeploymentOptions) {
  const {name, namespace, currentContext, kubeConfigPath} = options;
  const args = ['rollout restart deployment', name, '-n', namespace];
  const cmd = {
    commandId: uuid(),
    cmd: 'kubectl',
    args,
    context: currentContext,
    env: {
      KUBECONFIG: kubeConfigPath,
    },
  };

  await execute(cmd);
}

export default restartDeployment;
