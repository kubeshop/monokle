import {PROXY_SERVICE} from '@root/electron/app/services/cluster/globals';
import {DebugProxyArgs, DebugProxyResponse} from '@shared/ipc';

import {setup} from './setup';

export async function debugProxy({context, kubeconfig}: DebugProxyArgs): Promise<DebugProxyResponse> {
  try {
    const proxy = await PROXY_SERVICE.get(context, kubeconfig);
    return proxy.debugInfo;
  } catch (err) {
    // This means that either we never pinged or the proxy failed to boot.
    const result = await setup({context, kubeconfig});

    if (result.success) {
      const proxy = await PROXY_SERVICE.get(context, kubeconfig);
      return proxy.debugInfo;
    }

    return {
      cmd: 'kubectl proxy exitted',
      logs: [
        {
          type: 'stderr',
          timestamp: Date.now(),
          content: result.title,
        },
      ],
    };
  }
}
