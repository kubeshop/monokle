import {BrowserWindow} from 'electron';
import {configureStore} from '@reduxjs/toolkit';
import {forwardToRenderer, triggerAlias, replayActionMain} from 'electron-redux';

import {mainSlice} from './reducers/main';
import {configSlice} from './reducers/appConfig';
import {alertSlice} from './reducers/alert';
import {logsSlice} from './reducers/logs';
import {uiSlice} from './reducers/ui';

const multipleWindowMiddleware = () => (next: any) => (action: any) => {
  let windowID = 'NONE';
  if (BrowserWindow && BrowserWindow.getFocusedWindow()) {
    windowID = String((<any>BrowserWindow.getFocusedWindow()).id);
  }

  if (Number.isInteger(Number(windowID)) && action && action.type) {
    action.type = `${windowID}/${action.type}`;
    return next(action);
  }
};

const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    main: mainSlice.reducer,
    alert: alertSlice.reducer,
    logs: logsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: getDefaultMiddleware => [
    triggerAlias,
    ...getDefaultMiddleware(),
    multipleWindowMiddleware,
    forwardToRenderer,
  ],
});

replayActionMain(store);

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
