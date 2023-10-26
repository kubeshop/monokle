import {ipcRenderer} from 'electron';

import log from 'loglevel';

import {ERROR_MSG_FALLBACK} from '@shared/constants/constants';
import {CommandOptions, CommandResult} from '@shared/models/commands';
import {isDefined} from '@shared/utils/filter';
import {ensureRendererThread} from '@shared/utils/thread';

import electronStore from '../electronStore';

export function runCommandInMainThread(options: CommandOptions): Promise<CommandResult> {
  ensureRendererThread();
  log.info('sending command to main thread', options);

  const binaryPaths = electronStore.get('appConfig.binaryPaths');
  if (binaryPaths) {
    if (typeof binaryPaths.kubectl === 'string' && options.cmd.startsWith('kubectl')) {
      options.cmd = options.cmd.replace('kubectl', binaryPaths.kubectl);
    }
    if (typeof binaryPaths.helm === 'string' && options.cmd.startsWith('helm')) {
      options.cmd = options.cmd.replace('helm', binaryPaths.helm);
    }
  }

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
