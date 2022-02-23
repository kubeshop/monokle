import * as k8s from '@kubernetes/client-node';

import log from 'loglevel';
import {execSync} from 'child_process';

import {AppConfig, ClusterAccess, KubePermissions} from '@models/appconfig';

import {getMainProcessEnv} from '@utils/env';
import electronStore from '@utils/electronStore';

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

function parseCanI(stdout: string, namespace: string): ClusterAccess {
  const lines = stdout.split('\n');

  const permissions: KubePermissions[] = [];
  let hasFullAccess = false;

  lines.forEach((line, index) => {
    if (!index) {
      return;
    }
    const columns = line.split(/\s{2,100}/);

    const [resourceName, , , rawVerbs] = columns;

    if (!resourceName) {
      return;
    }

    const cleanVerbs = (rawVerbs as string)
      .replace('[', '')
      .replace(']', '');

    if (resourceName === '*.*' && cleanVerbs === '*') {
      hasFullAccess = true;
    }

    const verbs = cleanVerbs ? cleanVerbs.split(' ') : [];

    permissions.push({
      resourceName,
      verbs,
    });
  });

  return {
    permissions,
    hasFullAccess,
    namespace,
  };
}

export function getKubeAccess(namespace: string): ClusterAccess {
  // execSync(`kubectl config use-context ${currentContext}`);
  const command = `kubectl auth can-i --list --namespace=${namespace}`;
  const canStdOut = execSync(command).toString();
  return parseCanI(canStdOut, namespace);
}

export function hasAccessToResource(resourceName: string, verb: string, clusterAccess?: ClusterAccess) {
  if (!clusterAccess) {
    return false;
  }

  if (clusterAccess.hasFullAccess) {
    return true;
  }

  const resourceAccess = clusterAccess.permissions.find((access) => {
    return access.resourceName === resourceName.toLowerCase() && access.verbs.includes(verb);
  });

  return Boolean(resourceAccess);
}

interface ConfigNamespaceStore {
  namespaceName: string;
  clusterName: string;
}

export function addNamespaces(namespaces: ConfigNamespaceStore[]) {
  electronStore.set('kubeConfig.namespaces', namespaces);
}

export function addNamespace({ namespaceName, clusterName }: ConfigNamespaceStore) {
  const appNamespaces: ConfigNamespaceStore[] = electronStore.get('kubeConfig.namespaces') ?? [];
  const existingNamespace = appNamespaces
    .find((appNs) => appNs.namespaceName === namespaceName && appNs.clusterName === clusterName);
  if (existingNamespace) {
    return;
  }

  appNamespaces.push({ namespaceName, clusterName });
  electronStore.set('kubeConfig.namespaces', appNamespaces);
}

export function getNamespaces(clusterName?: string): ConfigNamespaceStore[] {
  const appNamespaces: ConfigNamespaceStore[] = electronStore.get('kubeConfig.namespaces') ?? [];
  if (clusterName) {
    return appNamespaces.filter((appNamespace) => appNamespace.clusterName === clusterName);
  }

  return appNamespaces;
}
