import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import {ClusterAccess} from '@shared/models/config';
import {getMainProcessEnv} from '@shared/utils/env';

export function createKubeClient(path?: string, context?: string, proxy?: number): k8s.KubeConfig {
  let kc = new k8s.KubeConfig();

  if (!path) {
    kc.loadFromDefault();
  } else {
    kc.loadFromFile(path);
  }

  if (proxy) {
    const proxyKubeConfig = new k8s.KubeConfig();
    proxyKubeConfig.loadFromOptions({
      currentContext: kc.getCurrentContext(),
      clusters: kc.getClusters().map(c => ({...c, server: `http://127.0.0.1:${proxy}`, skipTLSVerify: true})),
      users: kc.getUsers(),
      contexts: kc.getContexts(),
    });
    kc = proxyKubeConfig;
  }

  let currentContext = context;

  if (!currentContext) {
    currentContext = kc.currentContext;
    log.warn(`Missing currentContext, using default in kubeconfig: ${currentContext}`);
  } else {
    kc.setCurrentContext(currentContext);
  }

  if (!proxy) {
    // Apply current env to ExecAuthenticator
    // Skip if we use proxy since authentication is handled by kubectl-proxy.

    // find the context
    const ctxt = kc.contexts.find(c => c.name === currentContext);
    if (ctxt) {
      // find the user
      const user = kc.users.find(usr => usr.name === ctxt.user);

      // does the user use the ExecAuthenticator? -> apply process env
      if (user?.exec) {
        const mainProcessEnv = getMainProcessEnv();
        if (mainProcessEnv) {
          const envValues = Object.keys(mainProcessEnv).map(k => {
            return {name: k, value: mainProcessEnv[k]};
          });
          if (user.exec.env) {
            envValues.push(...user.exec.env);
          }

          user.exec.env = envValues;
        }
      }
    } else {
      throw new Error(`Selected context ${currentContext} not found in kubeconfig at ${path}`);
    }
  }

  return kc;
}

// TODO: verb should be typed as a union of all possible verbs
export function hasAccessToResourceKind(resourceKind: string, verb: string, clusterAccess?: ClusterAccess) {
  if (!clusterAccess) {
    return false;
  }

  if (clusterAccess.hasFullAccess) {
    return true;
  }

  const resourceAccess = clusterAccess.permissions.find(access => {
    return access.resourceKind === resourceKind.toLowerCase() && access.verbs.includes(verb);
  });

  return Boolean(resourceAccess);
}
