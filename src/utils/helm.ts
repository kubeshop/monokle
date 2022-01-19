import {ipcRenderer} from 'electron';

/**
 * Invokes Helm in main thread
 */
export function runHelm(cmd: any): any {
  return new Promise(resolve => {
    ipcRenderer.once('helm-result', (event, arg) => {
      resolve(arg);
    });
    ipcRenderer.send('run-helm', cmd);
  });
}
