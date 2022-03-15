import {ipcRenderer} from 'electron';

export const fetchAppVersion = () => {
  return new Promise<string>(resolve => {
    ipcRenderer.once('app-version', (_, {version}) => {
      resolve(version);
    });
    ipcRenderer.send('app-version');
  });
};
