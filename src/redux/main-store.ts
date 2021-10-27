import {BrowserWindow} from 'electron';
import {configureStore} from '@reduxjs/toolkit';
import {replayActionMain} from 'electron-redux';
import {isFSA} from '@utils/fluxStandardAction';

import {mainSlice} from './reducers/main';
import {configSlice} from './reducers/appConfig';
import {alertSlice} from './reducers/alert';
import {logsSlice} from './reducers/logs';
import {uiSlice} from './reducers/ui';

let lastFocusedWindow: BrowserWindow | null = null;

const forwardToRenderer = () => (next: any) => (action: any) => {
  if (!isFSA(action)) return next(action);
  if (action.meta && action.meta.scope === 'local') return next(action);

  const rendererAction = {
    ...action,
    meta: {
      ...action.meta,
      scope: 'local',
    },
  };

  if (BrowserWindow.getFocusedWindow()) {
    lastFocusedWindow = BrowserWindow.getFocusedWindow();
  }

  if (lastFocusedWindow) {
    lastFocusedWindow.webContents.send('redux-action', rendererAction);
  }

  return next(action);
};

const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    main: mainSlice.reducer,
    alert: alertSlice.reducer,
    logs: logsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: getDefaultMiddleware => [...getDefaultMiddleware(), forwardToRenderer],
});

replayActionMain(store);

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
