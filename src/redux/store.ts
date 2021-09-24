import {configureStore} from '@reduxjs/toolkit';
import logger from 'redux-logger';
import {forwardToMain, replayActionRenderer} from 'electron-redux';

import {mainSlice} from './reducers/main';
import {configSlice} from './reducers/appConfig';
import {alertSlice} from './reducers/alert';
import {logsSlice} from './reducers/logs';
import {uiSlice} from './reducers/ui';

const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    main: mainSlice.reducer,
    alert: alertSlice.reducer,
    logs: logsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: getDefaultMiddleware => [forwardToMain, ...getDefaultMiddleware().concat(logger)],
});

replayActionRenderer(store);

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
