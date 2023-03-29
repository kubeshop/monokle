import {UtilityProcess, app, utilityProcess} from 'electron';

import {ChildProcessWithoutNullStreams, spawn} from 'child_process';
import log from 'loglevel';
import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@shared/models/alert';
import electronStore from '@shared/utils/electronStore';
import {getKubeAccess} from '@shared/utils/kubeclient';

import {dispatchToAllWindows, dispatchToFocusedWindow} from './ipc/ipcMainRedux';

const PROXY_PORT_REGEX = /127.0.0.1:[0-9]+/;

let kubeServiceProcess: UtilityProcess | null = null;
let proxyPort: number | null = null;
let kubectlProxyProcess: ChildProcessWithoutNullStreams | null = null;

electronStore.onDidChange('appConfig.kubeConfig', () => {
  if (kubeServiceProcess) {
    startKubeConfigService();
  }
});

electronStore.onDidChange('appConfig.clusterProxyPort', () => {
  const newProxyPort = electronStore.get('appConfig.clusterProxyPort');
  if (newProxyPort === null && proxyPort !== null) {
    dispatchToFocusedWindow({type: 'config/setClusterProxyPort', payload: proxyPort});
  }
});

const initProxy = (kubeConfigPath: string) => {
  return new Promise((resolve, reject) => {
    try {
      kubectlProxyProcess = spawn('kubectl', ['proxy', '--port=0'], {
        env: {
          ...process.env,
          KUBECONFIG: kubeConfigPath,
        },
        shell: true,
        windowsHide: true,
      });

      kubectlProxyProcess.on('exit', () => {
        reject();
      });

      kubectlProxyProcess.stdout.on('data', data => {
        const proxyPortMatches = PROXY_PORT_REGEX.exec(data);
        const proxyPortString = proxyPortMatches?.[0]?.split(':')[1];
        proxyPort = proxyPortString ? parseInt(proxyPortString, 10) : null;
        resolve(proxyPort);
      });

      kubectlProxyProcess.stderr.on('data', data => {
        reject();
      });
    } catch (e: any) {
      reject();
    }
  });
};

export const startKubeConfigService = async () => {
  await initProxy(electronStore.get('appConfig.kubeConfig'));

  if (proxyPort === null) {
    return;
  }

  dispatchToAllWindows({type: 'config/setClusterProxyPort', payload: proxyPort});

  kubeServiceProcess = utilityProcess.fork(
    path.normalize(`${__dirname}/KubeConfigService.js`),
    [
      electronStore.get('appConfig.kubeConfig') || '',
      process.env.KUBECONFIG || '',
      path.join(app.getPath('home'), `${path.sep}.kube${path.sep}config`),
    ],
    {
      env: {
        KUBECONFIG_PROXY_PORT: String(proxyPort),
      },
    }
  );

  kubeServiceProcess.on('message', handleKubeServiceMessage);

  kubeServiceProcess.on('exit', () => {
    log.info('stop: watching cluster namespaces resources');
  });

  kubeServiceProcess.on('spawn', () => {
    log.info('start: watching cluster namespaces resources');
  });
};

export const stopKubeConfigService = () => {
  if (kubeServiceProcess) {
    killKubeConfigProcess();
  }
};

const handleKubeServiceMessage = (message: AnyAction) => {
  if (message.type) {
    dispatchToAllWindows(message);
    return;
  }

  if (message.event && message.event === 'watch/ObjectAdded') {
    getKubeAccess(message.objectName, message.context, message.kubeConfigPath)
      .then(clusterAccess => {
        dispatchToAllWindows({type: 'config/setKubeConfig', payload: message.payload});
        dispatchToAllWindows({type: 'config/setAccessLoading', payload: true});
        dispatchToAllWindows({type: 'config/addNamespaceToContext', payload: clusterAccess});
      })
      .catch(() => {
        dispatchToAllWindows({
          type: 'alert/setAlert',
          payload: {
            type: AlertEnum.Warning,
            title: 'Cluster Watcher Error',
            message:
              "We're unable to watch for namespaces changes in your cluster. This may be due to a lack of permissions.",
          },
        });
        dispatchToAllWindows({type: 'config/setAccessLoading', payload: false});
      });
  }

  if (message.event && message.event === 'watch/KubeConfigChanged') {
    killKubeConfigProcess();
    startKubeConfigService();
  }
};

const killKubeConfigProcess = () => {
  if (kubeServiceProcess?.pid) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', kubeServiceProcess.pid.toString(), '/f', '/t']);
    } else {
      kubeServiceProcess.kill();
    }
    kubeServiceProcess = null;
  }

  if (kubectlProxyProcess?.pid) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', kubectlProxyProcess.pid.toString(), '/f', '/t']);
    } else {
      kubectlProxyProcess.kill();
    }
    kubectlProxyProcess = null;
    proxyPort = null;
  }
};
