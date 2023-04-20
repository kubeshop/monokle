import {createKubeClient} from '@shared/utils/kubeclient';

import {setup} from './kube-control';

type CreateKubeClientArgs = {
  context: string;
  kubeconfig?: string;
  skipHealthCheck?: boolean;
};

export async function createKubeClientWithSetup(args: CreateKubeClientArgs) {
  const setupResponse = await setup(args);
  if (!setupResponse.success) throw new Error(setupResponse.code);
  return createKubeClient(args.kubeconfig, args.context, setupResponse.port);
}
