import {BrowserWindow} from 'electron';
import {replayActionMain} from 'electron-redux';

import {configureStore} from '@reduxjs/toolkit';

import {isFSA} from '@utils/fluxStandardAction';

import {alertSlice} from './reducers/alert';
import {configSlice} from './reducers/appConfig';
import {logsSlice} from './reducers/logs';
import {mainSlice} from './reducers/main';
import {uiSlice} from './reducers/ui';
import {uiCoachSlice} from './reducers/uiCoach';

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
    uiCoach: uiCoachSlice.reducer,
  },
  middleware: getDefaultMiddleware => [...getDefaultMiddleware(), forwardToRenderer],
});

replayActionMain(store);

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
