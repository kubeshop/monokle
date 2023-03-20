import * as k8s from '@kubernetes/client-node';

import {FSWatcher} from 'chokidar';
import fs from 'fs';
import log from 'loglevel';
import path from 'path';

const kubeConfigList: {[key: string]: {watcher: any; req: any}} = {};

function getKubeConfPath() {
  let kubeConfigPath = process.argv[2]; // kubeconig from path
  if (kubeConfigPath) {
    return kubeConfigPath;
  }

  kubeConfigPath = process.argv[3]; // kubeconig from env
  if (kubeConfigPath) {
    const envKubeconfigParts = kubeConfigPath.split(path.delimiter);
    return envKubeconfigParts[0];
  }

  kubeConfigPath = process.argv[4]; // kubeconig from settings
  if (kubeConfigPath) {
    return kubeConfigPath;
  }

  kubeConfigPath = process.argv[5]; // kubeconig from
  return kubeConfigPath;
}

function loadKubeConf() {
  let kubeConfigPath = process.argv[2]; // kubeconig from path
  if (kubeConfigPath) {
    const data = getKubeConfigContext(kubeConfigPath);
    process.parentPort.postMessage(data);
    return;
  }

  kubeConfigPath = process.argv[3]; // kubeconig from env
  if (kubeConfigPath) {
    const envKubeconfigParts = kubeConfigPath.split(path.delimiter);
    const data = getKubeConfigContext(envKubeconfigParts[0]);

    process.parentPort.postMessage(data);
    return;
  }

  kubeConfigPath = process.argv[4]; // kubeconig from settings
  if (kubeConfigPath) {
    const data = getKubeConfigContext(kubeConfigPath);

    process.parentPort.postMessage(data);
    return;
  }

  kubeConfigPath = process.argv[5]; // kubeconig from
  const data = getKubeConfigContext(kubeConfigPath);

  process.parentPort.postMessage(data);
}

export const getKubeConfigContext = (configPath: string) => {
  try {
    const kc = new k8s.KubeConfig();
    kc.loadFromFile(configPath);

    return {
      path: configPath,
      currentContext: kc.getCurrentContext(),
      isPathValid: kc.contexts.length > 0,
      contexts: kc.contexts,
    };
  } catch (error) {
    return {
      path: configPath,
      isPathValid: false,
      contexts: [],
    };
  }
};

function watchNamespace(context: string) {
  const kubeConfigPath = getKubeConfPath();
  const kc = new k8s.KubeConfig();
  kc.loadFromFile(kubeConfigPath);
  kc.setCurrentContext(context);

  kubeConfigList[context].watcher = new k8s.Watch(kc);
  kubeConfigList[context].watcher
    .watch(
      '/api/v1/namespaces',
      // optional query parameters can go here.
      {
        watch: 'true',
        allowWatchBookmarks: true,
      },
      // callback is called for each received object.
      (type: any, apiObj: any) => {
        if (type === 'ADDED') {
          process.parentPort.postMessage({objectname: apiObj.metadata.name, context, event: 'watch/ObjectAdded'});
        } else if (type === 'DELETED') {
          process.parentPort.postMessage({type: 'config/setAccessLoading', payload: true});
          process.parentPort.postMessage({
            type: 'config/removeNamespaceFromContext',
            payload: {namespace: apiObj.metadata.name, context},
          });
        }
      },
      (err: any) => {
        log.log(err);
        kubeConfigList[context].req.abort();
        kubeConfigList[context].watcher = null;
        kubeConfigList[context].req = null;
        watchNamespace(context);
      }
    )
    .then((req: any) => {
      kubeConfigList[context].req = req;
    });
}

function runNamespaceWatcher() {
  const kubeConfigPath = getKubeConfPath();
  const kc = new k8s.KubeConfig();
  kc.loadFromFile(kubeConfigPath);
  kc.contexts.forEach((context: any) => {
    kubeConfigList[context.name] = {watcher: null, req: null};
    watchNamespace(context.name);
  });
}

function main() {
  loadKubeConf();
  runNamespaceWatcher();
}

main();
// eslint-disable-next-line no-bitwise
setInterval(() => {}, 1 << 30);
