import {configureStore} from '@reduxjs/toolkit';
import logger from 'redux-logger';

import mainReducer from './reducers/main';
import {configSlice} from './reducers/appConfig';
import {alertSlice} from './reducers/alert';
import {logsSlice} from './reducers/logs';

const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    main: mainReducer,
    alert: alertSlice.reducer,
    logs: logsSlice.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(logger),
});

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
