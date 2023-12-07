import {Middleware, combineReducers, configureStore, createAction} from '@reduxjs/toolkit';

import {createLogger} from 'redux-logger';

import {shouldStopKustomizeDryRunListener} from '@redux/thunks/listeners/shouldStopKustomizeDryRunListener';

import {editorSlice} from '@editor/editor.slice';
import {editorListeners} from '@editor/listeners';

import {configSlice} from './appConfig';
import {appConfigListeners} from './appConfig/appConfig.listeners';
import {clusterListeners} from './cluster/listeners';
import {clusterSlice} from './cluster/slice';
import * as compareListeners from './compare/listeners';
import {compareSlice} from './compare/slice';
import {dashboardSlice} from './dashboard';
import {formSlice} from './forms';
import {gitSlice} from './git';
import {combineListeners, listenerMiddleware} from './listeners/base';
import {alertSlice} from './reducers/alert';
import {cloudSlice} from './reducers/cloud';
import {extensionSlice} from './reducers/extension';
import {mainSlice} from './reducers/main';
import {imageListParserListener} from './reducers/main/mainListeners';
import {killTerminalProcessesListener, removeTerminalListener, terminalSlice} from './reducers/terminal';
import {uiSlice} from './reducers/ui';
import {validationListeners} from './validation/validation.listeners';
import {validationSlice} from './validation/validation.slice';

declare global {
  interface Window {
    debug_state: Function;
  }
}

const middlewares: Middleware[] = [];

if (process.env.NODE_ENV === `development`) {
  const reduxLoggerMiddleware = createLogger({
    collapsed: (getState, action, logEntry) => !logEntry?.error,
  });

  middlewares.push(reduxLoggerMiddleware);
}

export const resetStore = createAction('app/reset');

combineListeners([
  ...editorListeners,
  compareListeners.resourceFetchListener('left'),
  compareListeners.resourceFetchListener('right'),
  compareListeners.compareListener,
  compareListeners.filterListener,
  killTerminalProcessesListener,
  removeTerminalListener,
  ...validationListeners,
  ...appConfigListeners,
  ...clusterListeners,
  imageListParserListener,
  shouldStopKustomizeDryRunListener,
]);

const appReducer = combineReducers({
  alert: alertSlice.reducer,
  compare: compareSlice.reducer,
  config: configSlice.reducer,
  extension: extensionSlice.reducer,
  main: mainSlice.reducer,
  terminal: terminalSlice.reducer,
  ui: uiSlice.reducer,
  git: gitSlice.reducer,
  form: formSlice.reducer,
  validation: validationSlice.reducer,
  dashboard: dashboardSlice.reducer,
  cluster: clusterSlice.reducer,
  editor: editorSlice.reducer,
  cloud: cloudSlice.reducer,
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
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    })
      .prepend(listenerMiddleware.middleware)
      .concat(middlewares),
});

window.debug_state = () => {
  // eslint-disable-next-line no-console
  console.log(store.getState());
};

export default store;
