import {runKubectlInMainThread} from '@utils/kubectl';

/**
 * Invokes kubectl apply for the specified yaml
 */

export function applyYamlToCluster(
  yaml: string,
  context: string,
  kubeconfig?: string,
  namespace?: {name: string; new: boolean}
) {
  const kubectlArgs = ['--context', context, 'apply', '-f', '-'];

  if (namespace) {
    kubectlArgs.unshift(...['--namespace', namespace.name]);
  }
  return runKubectlInMainThread(kubectlArgs, kubeconfig, yaml);
}
