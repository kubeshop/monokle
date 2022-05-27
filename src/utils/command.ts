import {ipcRenderer} from 'electron';

import log from 'loglevel';

import {ensureRendererThread} from '@utils/thread';

export type CommandOptions = {
  commandId: string;
  cmd: string;
  args: string[];
  env?: any;
  input?: string;
};

export type CommandResult = {
  commandId: string;
  exitCode: null | number;
  signal: null | string;
  stderr?: string;
  stdout?: string;
  error?: string;
};

export function runCommandInMainThread(options: CommandOptions): Promise<CommandResult> {
  ensureRendererThread();
  log.info('sending command to main thread', options);

  return new Promise<CommandResult>(resolve => {
    const cb = (_event: unknown, arg: CommandResult) => {
      if (arg.commandId !== options.commandId) return;
      ipcRenderer.off('command-result', cb);
      resolve(arg);
    };
    ipcRenderer.on('command-result', cb);
    ipcRenderer.send('run-command', options);
  });
}

export function hasCommandFailed({exitCode, error, stderr}: CommandResult): boolean {
  return exitCode !== 0 || error !== undefined || stderr !== undefined;
}
