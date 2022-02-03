import {spawn} from 'child_process';

import {PROCESS_ENV} from '@utils/env';
import {getShellPath} from '@utils/shell';

/**
 * Invokes kubectl apply for the specified yaml
 */

export function applyYamlToCluster(
  yaml: string,
  kubeconfig: string,
  context: string,
  namespace?: {name: string; new: boolean}
) {
  const spawnArgs = ['--context', context, 'apply', '-f', '-'];

  if (namespace) {
    spawnArgs.unshift(...['--namespace', namespace.name]);
  }

  const child = spawn('kubectl', spawnArgs, {
    env: {
      NODE_ENV: PROCESS_ENV.NODE_ENV,
      PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
      PATH: getShellPath(),
      KUBECONFIG: kubeconfig,
    },
  });
  child.stdin.write(yaml);
  child.stdin.end();
  return child;
}
