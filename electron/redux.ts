import {BrowserWindow, WebContents, ipcMain, webContents} from 'electron';

import {AnyAction} from 'redux';

import {RootState} from '@redux/store';

import {promiseTimeout} from '@utils/promises';

const FETCH_STORE_STATE_TIMEOUT = 10000;

export const dispatchToAllWindows = (action: AnyAction) => {
  const allWebContents = webContents.getAllWebContents();

  allWebContents.forEach(contents => {
    contents.send('redux-dispatch', action);
  });
};

export const dispatchToWindow = (window: BrowserWindow, action: AnyAction) => {
  window.webContents.send('redux-dispatch', action);
};

export const dispatchToFocusedWindow = (action: AnyAction) => {
  const focusedWebContents = webContents.getFocusedWebContents();
  focusedWebContents.send('redux-dispatch', action);
};

export const fetchStoreState = (contents: WebContents) => {
  return promiseTimeout<RootState>(
    new Promise<RootState>(resolve => {
      ipcMain.once(
        'redux-get-state-fulfilled',
        (_, {webContentsId, storeState}: {webContentsId: number; storeState: RootState}) => {
          if (contents.id === webContentsId) {
            resolve(storeState);
          }
        }
      );
      contents.send('redux-get-state', contents.id);
    }),
    FETCH_STORE_STATE_TIMEOUT
  );
};

export const fetchFocusedWindowStoreState = () => {
  const focusedWebContents = webContents.getFocusedWebContents();
  return fetchStoreState(focusedWebContents);
};

export const subscribeToStoreStateChanges = (contents: WebContents, callback: (state: RootState) => void) => {
  contents.send('redux-subscribe', contents.id);
  ipcMain.on(
    'redux-subscribe-triggered',
    (_, {webContentsId, storeState}: {webContentsId: number; storeState: RootState}) => {
      if (contents.id === webContentsId) {
        callback(storeState);
      }
    }
  );
};
