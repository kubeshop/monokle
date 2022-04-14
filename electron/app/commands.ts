import {BrowserWindow, dialog} from 'electron';

import {spawn} from 'child_process';
import {AnyAction} from 'redux';
import {VM} from 'vm2';

import {NewVersionCode} from '@models/appconfig';

import {updateNewVersion} from '@redux/reducers/appConfig';
import {InterpolateTemplateOptions} from '@redux/services/templates';

import {FileExplorerOptions, FileOptions} from '@atoms/FileExplorer/FileExplorerOptions';

import {CommandOptions, CommandResult} from '@utils/command';
import {ensureMainThread} from '@utils/thread';

import autoUpdater from './autoUpdater';

/**
 * Prompts to select a file using the native dialogs
 */
export const selectFileDialog = (event: Electron.IpcMainInvokeEvent, options: FileExplorerOptions) => {
  const browserWindow = BrowserWindow.fromId(event.sender.id);
  let dialogOptions: Electron.OpenDialogSyncOptions = {};
  if (options.isDirectoryExplorer) {
    dialogOptions.properties = ['openDirectory'];
  } else {
    if (options.allowMultiple) {
      dialogOptions.properties = ['multiSelections'];
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

/**
 * Checks for a new version of monokle
 */
export const checkNewVersion = async (dispatch: (action: AnyAction) => void, initial?: boolean) => {
  try {
    dispatch(updateNewVersion({code: NewVersionCode.Checking, data: {initial: Boolean(initial)}}));
    await autoUpdater.checkForUpdates();
  } catch (error: any) {
    if (error.errno === -2) {
      dispatch(updateNewVersion({code: NewVersionCode.Errored, data: {errorCode: -2, initial: Boolean(initial)}}));
    } else {
      dispatch(updateNewVersion({code: NewVersionCode.Errored, data: {errorCode: null, initial: Boolean(initial)}}));
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
      console.error(`Failed to interpolate [${js}]`, e.message);
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
  ensureMainThread();

  const result: CommandResult = {exitCode: null, signal: null};

  try {
    const child = spawn(options.cmd, options.args, {
      env: {
        ...options.env,
        ...process.env,
      },
      shell: true,
      windowsHide: true,
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
