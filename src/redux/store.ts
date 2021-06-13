import mainReducer from './reducers/main';
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { configSlice } from './reducers/appConfig';

const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    main: mainReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;
