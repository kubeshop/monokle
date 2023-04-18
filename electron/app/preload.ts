import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('api', {
  startKubeConfigService: () => {
    ipcRenderer.invoke('kubeService:start');
  },
  stopKubeConfigService: () => {
    ipcRenderer.invoke('kubeService:stop');
  },
});
