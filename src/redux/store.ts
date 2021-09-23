import {configureStore} from '@reduxjs/toolkit';
import logger from 'redux-logger';
import {forwardToMain, replayActionRenderer} from 'electron-redux';
import {remote} from 'electron';

import {mainSlice} from './reducers/main';
import {configSlice} from './reducers/appConfig';
import {alertSlice} from './reducers/alert';
import {logsSlice} from './reducers/logs';
import {uiSlice} from './reducers/ui';

let windowID: number = remote.getCurrentWindow().id;

const multipleWindowMiddleware = () => (next: any) => (action: any) => {
  const actionPrefix = action && action.type && action.type.split('/')[0];
  const destinationWindowID = Number(actionPrefix);

  if (Number.isInteger(destinationWindowID) && destinationWindowID === windowID && action && action.type) {
    action.type = action.type.replace(`${actionPrefix}/`, '');
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
    forwardToMain,
    ...getDefaultMiddleware().concat(logger),
    multipleWindowMiddleware,
  ],
});

replayActionRenderer(store);

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
