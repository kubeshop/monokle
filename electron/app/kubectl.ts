import {IpcMainEvent} from 'electron';

import {ChildProcessWithoutNullStreams, spawn} from 'child_process';

let kubectlProxyProcess: ChildProcessWithoutNullStreams | undefined;

export const startKubectlProxyProcess = async (event: IpcMainEvent) => {
  killKubectlProxyProcess();

  try {
    kubectlProxyProcess = spawn('kubectl', ['proxy', '--port=0', '--append-server-path'], {
      env: {
        ...process.env,
      },
      shell: true,
      windowsHide: true,
    });

    kubectlProxyProcess.on('exit', (code, signal) => {
      event.sender.send('kubectl-proxy-event', {
        type: 'exit',
        result: {exitCode: code, signal: signal?.toString()},
      });
    });

    kubectlProxyProcess.stdout.on('data', data => {
      event.sender.send('kubectl-proxy-event', {
        type: 'stdout',
        result: {data: data?.toString()},
      });
    });

    kubectlProxyProcess.stderr.on('data', data => {
      event.sender.send('kubectl-proxy-event', {
        type: 'stderr',
        result: {data: data?.toString()},
      });
    });
  } catch (e: any) {
    event.sender.send('kubectl-proxy-event', {
      type: 'error',
      result: {message: e?.message},
    });
  }
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
