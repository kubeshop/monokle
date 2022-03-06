import {ipcRenderer} from 'electron';

import log from 'loglevel';

import {ensureRendererThread} from '@utils/thread';

export type CommandOptions = {
  cmd: string;
  args: string[];
  env?: any;
  input?: string;
};

export type CommandResult = {
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
    ipcRenderer.once('command-result', (event, arg: CommandResult) => {
      resolve(arg);
    });
    ipcRenderer.send('run-command', options);
  });
}
