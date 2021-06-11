import mainReducer from './reducer';
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

const store = configureStore({
  reducer: mainReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;
