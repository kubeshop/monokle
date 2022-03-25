import {runCommandInMainThread} from '@utils/command';

/**
 * Invokes kubectl apply for the specified yaml
 */

interface ApplyToClusterParams {
  yaml: string;
  context: string;
  kubeconfig?: string;
  namespace?: {
    name: string;
    new: boolean;
  };
}

export function applyYamlToCluster({yaml, context, namespace, kubeconfig}: ApplyToClusterParams) {
  const kubectlArgs = ['--context', context, 'apply', '-f', '-'];

  if (namespace) {
    kubectlArgs.unshift(...['--namespace', namespace.name]);
  }
  return runCommandInMainThread({args: kubectlArgs, cmd: 'kubectl', input: yaml, env: {KUBECONFIG: kubeconfig}});
}
