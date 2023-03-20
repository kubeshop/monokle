import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // initKubeConfig: () => ipcRenderer.invoke('initKubeConfig'),
});
