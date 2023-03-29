import * as k8s from '@kubernetes/client-node';

import {FSWatcher, watch} from 'chokidar';
import fs from 'fs';
import log from 'loglevel';
import fetch from 'node-fetch';
import path from 'path';

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

  kubeConfigPath = process.argv[4]; // kubeconig from .kube
  return kubeConfigPath;
}

const readKubeConfigFile = (filePath: string) => {
  try {
    let kc = new k8s.KubeConfig();
    kc.loadFromFile(filePath);

    return {
      path: filePath,
      isPathValid: kc.contexts.length > 0,
      contexts: kc.contexts,
      currentContext: kc.currentContext,
    };
  } catch (error) {
    return {
      path: filePath,
      isPathValid: false,
      contexts: [],
    };
  }
};

async function loadKubeConf() {
  let kubeConfigPath = process.argv[2]; // kubeconig from path
  if (kubeConfigPath) {
    const data = await readKubeConfigFile(kubeConfigPath);
    process.parentPort.postMessage({type: 'config/setKubeConfig', payload: data});
    return;
  }

  kubeConfigPath = process.argv[3]; // kubeconig from env
  if (kubeConfigPath) {
    const envKubeconfigParts = kubeConfigPath.split(path.delimiter);
    const data = await readKubeConfigFile(envKubeconfigParts[0]);

    process.parentPort.postMessage({type: 'config/setKubeConfig', payload: data});
    if (envKubeconfigParts.length > 1) {
      process.parentPort.postMessage({
        type: 'alert/setAlert',
        payload: {
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: 2, // AlertEnum.Warning,
        },
      });
    }
    return;
  }

  kubeConfigPath = process.argv[4]; // kubeconig from .kube
  const data = await readKubeConfigFile(kubeConfigPath);
  process.parentPort.postMessage({type: 'config/setKubeConfig', payload: data});
}

let watcher: FSWatcher;
let abortSignal: AbortController;

async function monitorKubeConfig() {
  const filePath = getKubeConfPath();

  if (watcher) {
    watcher.close();
  }

  if (!filePath) {
    return;
  }

  try {
    const stats = await fs.promises.stat(filePath);
    if (stats.isFile()) {
      watcher = watch(filePath, {
        persistent: true,
        usePolling: true,
        interval: 1000,
        ignoreInitial: true,
      });

      watcher.on('all', (type: string) => {
        if (type === 'unlink') {
          watcher.close();
          process.parentPort.postMessage({type: 'config/setKubeConfig', payload: {path: filePath}});
          if (abortSignal) {
            abortSignal.abort();
          }
          watchCurrentContext();
          return;
        }
        process.parentPort.postMessage({event: 'watch/KubeConfigChanged'});
        process.parentPort.postMessage({type: 'config/setKubeConfig', payload: {path: filePath}});

        if (abortSignal) {
          abortSignal.abort();
        }
        watchCurrentContext();
      });
    }
  } catch (e: any) {
    log.error('monitorKubeConfigError', e.message);
  }
}

async function loadCurrentContextNamespaces() {
  abortSignal = new AbortController();
  const kubeConfigPath = getKubeConfPath();
  const kubeConfigData = readKubeConfigFile(kubeConfigPath);
  const proxyPort = process.env.KUBECONFIG_PROXY_PORT;
  const baseURL = `http://localhost:${proxyPort}`;

  const response = await fetch(`${baseURL}/api/v1/namespaces`, {
    signal: abortSignal.signal as any,
  });
  const json = await response.json();
  json.items.forEach((apiObj: any) => {
    process.parentPort.postMessage({
      objectName: apiObj.metadata.name,
      context: kubeConfigData.currentContext,
      event: 'watch/ObjectAdded',
      payload: readKubeConfigFile(kubeConfigPath),
    });
  });
}

async function watchCurrentContext() {
  abortSignal = new AbortController();
  const kubeConfigPath = getKubeConfPath();
  const kubeConfigData = readKubeConfigFile(kubeConfigPath);
  const proxyPort = process.env.KUBECONFIG_PROXY_PORT;
  const baseURL = `http://localhost:${proxyPort}`;

  const response = await fetch(`${baseURL}/api/v1/namespaces?watch=true`, {
    signal: abortSignal.signal as any,
  });

  response.body.on('data', (chunk: any) => {
    try {
      const {type, object: apiObj} = JSON.parse(chunk);
      if (type === 'ADDED') {
        process.parentPort.postMessage({
          objectName: apiObj.metadata.name,
          context: kubeConfigData.currentContext,
          event: 'watch/ObjectAdded',
          payload: readKubeConfigFile(kubeConfigPath),
        });
      } else if (type === 'DELETED') {
        process.parentPort.postMessage({type: 'config/setAccessLoading', payload: true});
        process.parentPort.postMessage({
          type: 'config/removeNamespaceFromContext',
          payload: {namespace: apiObj.metadata.name, context: kubeConfigData.currentContext},
        });
      }
    } catch (e: any) {
      log.error('watchCurrentContext', e.message);
    }
  });

  response.body.on('error', (err: any) => {
    abortSignal.abort();
    watchCurrentContext();
  });

  response.body.on('end', () => {
    watchCurrentContext();
  });
}

function main() {
  loadKubeConf();
  loadCurrentContextNamespaces();
  monitorKubeConfig();
}

main();

// to keep the process alive
// eslint-disable-next-line no-bitwise
setInterval(() => {}, 1 << 30);
