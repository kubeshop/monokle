import {IpcMainEvent} from 'electron';

import {ChildProcessWithoutNullStreams, spawn} from 'child_process';

let kubectlProxyProcess: ChildProcessWithoutNullStreams | undefined;

export const startKubectlProxyProcess = (event: IpcMainEvent, port: number) => {
  try {
    const child = spawn('kubectl', ['proxy', '--port', `${port}`], {
      env: {
        ...process.env,
      },
      shell: true,
      windowsHide: true,
    });

    child.on('exit', (code, signal) => {
      event.sender.send('kubectl-proxy-event', {
        type: 'exit',
        result: {exitCode: code, signal: signal?.toString()},
      });
    });

    child.stdout.on('data', data => {
      event.sender.send('kubectl-proxy-event', {
        type: 'stdout',
        result: {data: data?.toString()},
      });
    });

    child.stderr.on('data', data => {
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
  if (kubectlProxyProcess) {
    kubectlProxyProcess.kill();
  }
};
