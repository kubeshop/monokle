import {Middleware, combineReducers, configureStore, createAction} from '@reduxjs/toolkit';

import {createLogger} from 'redux-logger';

import {sectionBlueprintMiddleware} from '@src/navsections/sectionBlueprintMiddleware';

import * as compareListeners from './compare/listeners';
import {compareSlice} from './compare/slice';
import {formSlice} from './forms';
import {gitSlice} from './git';
import {combineListeners, listenerMiddleware} from './listeners/base';
import {alertSlice} from './reducers/alert';
import {configSlice} from './reducers/appConfig';
import {extensionSlice} from './reducers/extension';
import {logsSlice} from './reducers/logs';
import {imageSelectedListener, mainSlice, resourceMapChangedListener} from './reducers/main';
import {navigatorSlice, updateNavigatorInstanceState} from './reducers/navigator';
import {removedTerminalListener, terminalSlice} from './reducers/terminal';
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
  compareListeners.resourceFetchListener('left'),
  compareListeners.resourceFetchListener('right'),
  compareListeners.compareListener,
  compareListeners.filterListener,
  resourceMapChangedListener,
  imageSelectedListener,
  removedTerminalListener,
]);

const appReducer = combineReducers({
  alert: alertSlice.reducer,
  compare: compareSlice.reducer,
  config: configSlice.reducer,
  extension: extensionSlice.reducer,
  logs: logsSlice.reducer,
  main: mainSlice.reducer,
  navigator: navigatorSlice.reducer,
  terminal: terminalSlice.reducer,
  ui: uiSlice.reducer,
  uiCoach: uiCoachSlice.reducer,
  git: gitSlice.reducer,
  form: formSlice.reducer,
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
