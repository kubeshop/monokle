import {Middleware, combineReducers, configureStore, createAction} from '@reduxjs/toolkit';

import {createLogger} from 'redux-logger';

import {sectionBlueprintMiddleware} from '@src/navsections/sectionBlueprintMiddleware';

import {combineListeners, listenerMiddleware} from './listeners/base';
import {alertSlice} from './reducers/alert';
import {configSlice} from './reducers/appConfig';
import {compareListener, compareSlice, filterListener, resourceFetchListener} from './reducers/compare';
import {extensionSlice} from './reducers/extension';
import {logsSlice} from './reducers/logs';
import {imageSelectedListener, mainSlice, resourceMapChangedListener} from './reducers/main';
import {navigatorSlice, updateNavigatorInstanceState} from './reducers/navigator';
import {uiSlice} from './reducers/ui';
import {uiCoachSlice} from './reducers/uiCoach';

const middlewares: Middleware[] = [];

if (process.env.NODE_ENV === `development`) {
  const reduxLoggerMiddleware = createLogger({
    predicate: (getState, action) => action.type !== updateNavigatorInstanceState.type,
    collapsed: (getState, action, logEntry) => !logEntry?.error,
  });

  middlewares.push(reduxLoggerMiddleware);
}

export const resetStore = createAction('app/reset');

combineListeners([
  resourceFetchListener('left'),
  resourceFetchListener('right'),
  compareListener,
  filterListener,
  resourceMapChangedListener,
  imageSelectedListener,
]);

const appReducer = combineReducers({
  config: configSlice.reducer,
  main: mainSlice.reducer,
  alert: alertSlice.reducer,
  logs: logsSlice.reducer,
  ui: uiSlice.reducer,
  navigator: navigatorSlice.reducer,
  uiCoach: uiCoachSlice.reducer,
  extension: extensionSlice.reducer,
  compare: compareSlice.reducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (resetStore.match(action)) {
    // Invoking reducers with `undefined` sets initial state.
    // see https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store/35641992#35641992
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(middlewares)
      .concat(sectionBlueprintMiddleware),
});

export default store;
