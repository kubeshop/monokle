import {v4 as uuid} from 'uuid';

import {execute} from '@shared/utils/commands';

type ScaleDeploymentOptions = {
  replicas: number;
  name: string;
  namespace: string;
  currentContext?: string;
  kubeConfigPath?: string;
};

async function scaleDeployment(options: ScaleDeploymentOptions) {
  const {replicas, name, namespace, currentContext, kubeConfigPath} = options;
  const args = ['scale deployment', name, `--replicas=${replicas}`, '-n', namespace];
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

export default scaleDeployment;
