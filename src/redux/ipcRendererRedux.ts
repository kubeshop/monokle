import {ipcRenderer} from 'electron';

import {debounce} from 'lodash';
import {AnyAction} from 'redux';

import store from './store';

const storeSubscribers: number[] = [];

ipcRenderer.on('redux-dispatch', (_, action: AnyAction) => {
  store.dispatch(action);
});

ipcRenderer.on('redux-get-state', (_, webContentsId: number) => {
  ipcRenderer.send('redux-get-state-fulfilled', {webContentsId, storeState: store.getState()});
});

ipcRenderer.on('redux-subscribe', (_, webContentsId: number) => {
  if (storeSubscribers.includes(webContentsId)) {
    return;
  }
  storeSubscribers.push(webContentsId);
  const sendTrigger = debounce(() => {
    ipcRenderer.send('redux-subscribe-triggered', {webContentsId, storeState: store.getState()});
  }, 500);
  store.subscribe(() => {
    sendTrigger();
  });
});
