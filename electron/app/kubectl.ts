import {BrowserWindow, IpcMainInvokeEvent} from 'electron';

import {ChildProcessWithoutNullStreams, spawn} from 'child_process';

import {ClusterProxyOptions} from '@shared/models/cluster';
import electronStore from '@shared/utils/electronStore';

import {dispatchToWindow} from './ipc/ipcMainRedux';

let kubectlProxyProcess: ChildProcessWithoutNullStreams | undefined;
const PROXY_PORT_REGEX = /127.0.0.1:[0-9]+/;
let windowId: number = -1;
export const startKubectlProxyProcess = async (event: IpcMainInvokeEvent, args: ClusterProxyOptions) => {
  killKubectlProxyProcess();

  return new Promise((resolve, reject) => {
    try {
      windowId = event.sender.id;
      let kubeConfigPath = args.kubeConfigPath;
      if (!kubeConfigPath || kubeConfigPath === '') {
        kubeConfigPath = electronStore.get('appConfig.kubeConfig');
      }

      kubectlProxyProcess = spawn('kubectl', ['proxy', '--port=0'], {
        env: {
          ...process.env,
          KUBECONFIG: kubeConfigPath,
        },
        shell: true,
        windowsHide: true,
      });

      kubectlProxyProcess.on('exit', (code, signal) => {
        event.sender.send('kubectl-proxy-event', {
          type: 'exit',
          result: {exitCode: code, signal: signal?.toString()},
        });
        const window = BrowserWindow.fromId(windowId) || BrowserWindow.getFocusedWindow();
        if (window) {
          dispatchToWindow(window, {type: 'config/setClusterProxyPort', payload: null});
        }
      });

      kubectlProxyProcess.stdout.on('data', data => {
        const proxyPortMatches = PROXY_PORT_REGEX.exec(data);
        const proxyPortString = proxyPortMatches?.[0]?.split(':')[1];
        const proxyPort = proxyPortString ? parseInt(proxyPortString, 10) : null;
        resolve(proxyPort);
        event.sender.send('kubectl-proxy-event', {
          type: 'stdout',
          result: {data: data?.toString()},
        });
      });

      kubectlProxyProcess.stderr.on('data', data => {
        reject();
        event.sender.send('kubectl-proxy-event', {
          type: 'stderr',
          result: {data: data?.toString()},
        });
      });
    } catch (e: any) {
      console.log('error', e.message);
      reject();

      event.sender.send('kubectl-proxy-event', {
        type: 'error',
        result: {message: e?.message},
      });
    }
  });
};

export const killKubectlProxyProcess = () => {
  if (kubectlProxyProcess?.pid) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', kubectlProxyProcess.pid.toString(), '/f', '/t']);
    } else {
      kubectlProxyProcess.kill();
    }
  }
};
