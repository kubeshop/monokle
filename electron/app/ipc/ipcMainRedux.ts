import {BrowserWindow, WebContents, ipcMain, webContents} from 'electron';

import {AnyAction} from 'redux';

import type {ElectronMenuDataType, RootState} from '@shared/models/rootState';
import {promiseTimeout} from '@shared/utils/promises';

const FETCH_STORE_STATE_TIMEOUT = 10000;

export type MainDispatch = (action: AnyAction) => void;

export const dispatchToAllWindows = (action: AnyAction) => {
  const allWebContents = webContents.getAllWebContents();

  allWebContents.forEach(contents => {
    contents.send('redux-dispatch', action);
  });
};

export const dispatchToWindow = (window: BrowserWindow, action: AnyAction) => {
  if (!window || window.isDestroyed()) {
    return;
  }

  window.webContents.send('redux-dispatch', action);
};

export const createDispatchForWindow = (window: BrowserWindow) => {
  return dispatchToWindow.bind(null, window);
};

export const dispatchToFocusedWindow = (action: AnyAction) => {
  const focusedWebContents = webContents.getFocusedWebContents();
  if (focusedWebContents) {
    focusedWebContents.send('redux-dispatch', action);
  }
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
  return focusedWebContents ? fetchStoreState(focusedWebContents) : undefined;
};

export const subscribeToStoreStateChanges = (
  contents: WebContents,
  propertiesToPick: string[],
  callback: (state: ElectronMenuDataType, title: string, unsavedResourceCount: number) => void
) => {
  contents.send('redux-subscribe', {webContentsId: contents.id, propertiesToPick});
  ipcMain.on(
    'redux-subscribe-triggered',
    (
      _,
      {
        webContentsId,
        storeState,
        windowTitle,
        unsavedResourceCount,
      }: {webContentsId: number; storeState: ElectronMenuDataType; windowTitle: string; unsavedResourceCount: number}
    ) => {
      if (contents.id === webContentsId) {
        callback(storeState, windowTitle, unsavedResourceCount);
      }
    }
  );
};
