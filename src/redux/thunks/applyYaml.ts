import {v4 as uuid} from 'uuid';

import {runCommandInMainThread} from '@shared/utils/commands';

/**
 * Invokes kubectl apply for the specified yaml
 */

interface ApplyToClusterParams {
  yaml: string;
  context?: string;
  kubeconfig?: string;
  namespace?: {
    name: string;
    new: boolean;
  };
}

export function applyYamlToCluster({yaml, context, namespace, kubeconfig}: ApplyToClusterParams) {
  const globalFlags = context ? ['--context', context] : [];
  const kubectlArgs = [...globalFlags, 'apply', '-f', '-'];

  if (namespace) {
    kubectlArgs.unshift(...['--namespace', namespace.name]);
  }
  return runCommandInMainThread({
    commandId: uuid(),
    args: kubectlArgs,
    cmd: 'kubectl',
    input: yaml,
    env: {KUBECONFIG: kubeconfig},
  });
}
