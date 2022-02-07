import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';

import {AppConfig} from '@models/appconfig';

import {getMainProcessEnv} from '@redux/reducers/main';

export function createKubeClient(config: string | AppConfig, context?: string) {
  const kc = new k8s.KubeConfig();

  const path = typeof config === 'string' ? config : config.projectConfig?.kubeConfig?.path || config.kubeConfig.path;
  if (!path) {
    throw new Error('Missing path to kubeconfing');
  }

  kc.loadFromFile(path);
  let currentContext =
    typeof config === 'string'
      ? context
      : config.projectConfig?.kubeConfig?.currentContext || config.kubeConfig.currentContext;

  if (!currentContext) {
    currentContext = kc.currentContext;
    log.warn(`Missing currentContext, using default in kubeconfig: ${currentContext}`);
  } else {
    kc.setCurrentContext(currentContext);
  }

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

  return kc;
}
