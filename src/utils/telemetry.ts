import {ipcRenderer} from 'electron';

export const trackEvent = (eventName: string, payload?: any) => {
  ipcRenderer.send('track-event', {eventName, payload});
};
export const trackError = (error: any) => {
  ipcRenderer.send('track-event', {error});
};
