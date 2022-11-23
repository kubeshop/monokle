import {BrowserWindow, dialog} from 'electron';

import {spawn} from 'child_process';
import log from 'loglevel';
import {AnyAction} from 'redux';
import {VM} from 'vm2';

import type {CommandOptions, CommandResult} from '@monokle-desktop/shared/models/commands';
import {NewVersionCode} from '@monokle-desktop/shared/models/config';
import type {FileExplorerOptions, FileOptions} from '@monokle-desktop/shared/models/fileExplorer';
import type {InterpolateTemplateOptions} from '@monokle-desktop/shared/models/template';

import autoUpdater from './autoUpdater';

/**
 * Prompts to select a file using the native dialogs
 */
export const selectFileDialog = (event: Electron.IpcMainInvokeEvent, options: FileExplorerOptions) => {
  const browserWindow = BrowserWindow.fromId(event.sender.id);
  const dialogOptions: Electron.OpenDialogSyncOptions = {
    properties: ['openFile'],
  };

  if (options.isDirectoryExplorer) {
    dialogOptions.properties = ['openDirectory'];
  } else {
    if (options.allowMultiple) {
      dialogOptions.properties?.push('multiSelections');
    }
    if (options.acceptedFileExtensions) {
      dialogOptions.filters = [{name: 'Files', extensions: options.acceptedFileExtensions}];
    }
  }

  dialogOptions.properties?.push('createDirectory');

  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }

  if (browserWindow) {
    return dialog.showOpenDialogSync(browserWindow, dialogOptions);
  }
  return dialog.showOpenDialogSync(dialogOptions);
};

/**
 * Prompts to select a file using the native dialogs
 */
export const saveFileDialog = (event: Electron.IpcMainInvokeEvent, options: FileOptions) => {
  const browserWindow = BrowserWindow.fromId(event.sender.id);
  let dialogOptions: Electron.SaveDialogSyncOptions = {};
  if (options.acceptedFileExtensions) {
    dialogOptions.filters = [{name: 'Files', extensions: options.acceptedFileExtensions}];
  }

  dialogOptions.properties?.push('createDirectory');

  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }

  if (options.title) {
    dialogOptions.title = options.title;
  }

  if (browserWindow) {
    return dialog.showSaveDialogSync(browserWindow, dialogOptions);
  }
  return dialog.showSaveDialogSync(dialogOptions);
};

export const forceLoad = (event: Electron.IpcMainInvokeEvent) => {
  const browserWindow = BrowserWindow.fromId(event.sender.id);
  browserWindow?.webContents.reloadIgnoringCache();
};

/**
 * Checks for a new version of monokle
 */
export const checkNewVersion = async (dispatch: (action: AnyAction) => void, initial?: boolean) => {
  try {
    dispatch({
      type: 'config/updateNewVersion',
      payload: {code: NewVersionCode.Checking, data: {initial: Boolean(initial)}},
    });

    await autoUpdater.checkForUpdates();
  } catch (error: any) {
    if (error.errno === -2) {
      dispatch({
        type: 'config/updateNewVersion',
        payload: {code: NewVersionCode.Errored, data: {errorCode: -2, initial: Boolean(initial)}},
      });
    } else {
      dispatch({
        type: 'config/updateNewVersion',
        payload: {code: NewVersionCode.Errored, data: {errorCode: null, initial: Boolean(initial)}},
      });
    }
  }
};

/**
 * Interpolates the provided vanilla template in a sandboxed vm
 */
export const interpolateTemplate = (args: InterpolateTemplateOptions, event: Electron.IpcMainEvent) => {
  const vm = new VM({
    eval: false,
    wasm: false,
    fixAsync: true,
    sandbox: {
      forms: args.formsData,
    },
  });
  let text: string = args.templateText;
  let result: string = '';

  let ix = text.indexOf('[[');
  while (ix >= 0) {
    let ix2 = text.indexOf(']]', ix + 2);
    if (ix2 === -1) {
      break;
    }
    result += text.substring(0, ix);
    const js = text.substring(ix + 2, ix2);

    try {
      result += vm.run(js);
    } catch (e: any) {
      log.error(`Failed to interpolate [${js}]`, e.message);
    }
    text = text.substring(ix2 + 2);

    ix = text.indexOf('[[');
  }

  // add any leftover
  result += text;

  event.sender.send('interpolate-vanilla-template-result', result);
};

/**
 * Called by the renderer thread to run a command and capture its output
 */
export const runCommand = (options: CommandOptions, event: Electron.IpcMainEvent) => {
  const result: CommandResult = {
    commandId: options.commandId,
    exitCode: null,
    signal: null,
  };

  try {
    const child = spawn(options.cmd, options.args, {
      env: {
        ...options.env,
        ...process.env,
      },
      shell: true,
      windowsHide: true,
      cwd: options.cwd,
    });

    if (options.input) {
      child.stdin.write(options.input);
      child.stdin.end();
    }

    child.on('exit', (code, signal) => {
      result.exitCode = code;
      result.signal = signal && signal.toString();
      event.sender.send('command-result', result);
    });

    child.stdout.on('data', data => {
      result.stdout = result.stdout ? result.stdout + data.toString() : data.toString();
    });

    child.stderr.on('data', data => {
      result.stderr = result.stderr ? result.stderr + data.toString() : data.toString();
    });
  } catch (e: any) {
    result.error = e.message;
    event.sender.send('command-result', result);
  }
};
