import {ipcRenderer} from 'electron';

import events from 'events';
import log from 'loglevel';

import {ERROR_MSG_FALLBACK} from '@constants/constants';

import {isDefined} from '@utils/filter';
import {ensureRendererThread} from '@utils/thread';

export type CommandOptions = {
  commandId: string;
  cmd: string;
  args: string[];
  env?: any;
  input?: string;
  cwd?: string;
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

export async function runCommandStreamInMainThread(listener: (...args: any[]) => void, options: CommandOptions) {
  ensureRendererThread();
  log.info('sending command stream to main thread', options);
  const commandEventEmitter = new events.EventEmitter();
  commandEventEmitter.addListener(options.commandId, listener);

  const cb = (_event: unknown, arg: any) => {
    if (arg.commandId !== options.commandId) return;
    commandEventEmitter.emit(options.commandId, arg);
  };
  ipcRenderer.on('command-stream-event', cb);
  ipcRenderer.send('run-command-stream', options);
}

export async function execute(options: CommandOptions): Promise<string> {
  const result = await runCommandInMainThread(options);

  if (hasCommandFailed(result) || !isDefined(result.stdout)) {
    const msg = result.error ?? result.stderr ?? ERROR_MSG_FALLBACK;
    throw new Error(msg);
  }

  return result.stdout;
}

export function hasCommandFailed({exitCode, error, stderr}: CommandResult): boolean {
  return exitCode !== 0 || error !== undefined || stderr !== undefined;
}
