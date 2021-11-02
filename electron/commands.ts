import {execSync} from 'child_process';
import {PROCESS_ENV} from '@utils/env';
import {BrowserWindow, dialog} from 'electron';
import mainStore from '@redux/main-store';
import {updateNewVersion} from '@redux/reducers/appConfig';
import {NewVersionCode} from '@models/appconfig';
import {autoUpdater} from 'electron-updater';
import {KustomizeCommandType} from '@redux/services/kustomize';

/**
 * called by thunk to preview a kustomization
 */

export const runKustomize = (folder: string, kustomizeCommand: KustomizeCommandType, event: Electron.IpcMainEvent) => {
  try {
    let cmd = kustomizeCommand === 'kubectl' ? 'kubectl kustomize' : 'kustomize build ';
    let stdout = execSync(`${cmd} .`, {
      cwd: folder,
      env: {
        NODE_ENV: PROCESS_ENV.NODE_ENV,
        PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
      },
    });

    event.sender.send('kustomize-result', {stdout: stdout.toString()});
  } catch (e: any) {
    event.sender.send('kustomize-result', {error: e.toString()});
  }
};

/**
 * prompts to select a file using the native dialogs
 */

export const selectFile = (event: Electron.IpcMainInvokeEvent, options: any) => {
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

  if (options.defaultPath) {
    dialogOptions.defaultPath = options.defaultPath;
  }

  if (browserWindow) {
    return dialog.showOpenDialogSync(browserWindow, dialogOptions);
  }
  return dialog.showOpenDialogSync(dialogOptions);
};

/**
 * called by thunk to preview a helm chart with values file
 */

export const runHelm = (args: any, event: Electron.IpcMainEvent) => {
  try {
    let stdout = execSync(args.helmCommand, {
      cwd: args.cwd,
      env: {
        NODE_ENV: PROCESS_ENV.NODE_ENV,
        PUBLIC_URL: PROCESS_ENV.PUBLIC_URL,
        KUBECONFIG: args.kubeconfig,
      },
    });

    event.sender.send('helm-result', {stdout: stdout.toString()});
  } catch (e: any) {
    event.sender.send('helm-result', {error: e.toString()});
  }
};

/**
 * Checks for a new version of monokle
 */

export const checkNewVersion = async (initial?: boolean) => {
  try {
    mainStore.dispatch(updateNewVersion({code: NewVersionCode.Checking, data: {initial: Boolean(initial)}}));
    await autoUpdater.checkForUpdates();
  } catch (error: any) {
    if (error.errno === -2) {
      mainStore.dispatch(
        updateNewVersion({code: NewVersionCode.Errored, data: {errorCode: -2, initial: Boolean(initial)}})
      );
    } else {
      mainStore.dispatch(
        updateNewVersion({code: NewVersionCode.Errored, data: {errorCode: null, initial: Boolean(initial)}})
      );
    }
  }
};
