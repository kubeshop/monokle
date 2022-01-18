import {Middleware, configureStore} from '@reduxjs/toolkit';

import {createLogger} from 'redux-logger';

import {sectionBlueprintMiddleware} from '@src/navsections/sectionBlueprintMiddleware';

import {alertSlice} from './reducers/alert';
import {configSlice} from './reducers/appConfig';
import {extensionSlice} from './reducers/extension';
import {logsSlice} from './reducers/logs';
import {mainSlice} from './reducers/main';
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

const store = configureStore({
  reducer: {
    config: configSlice.reducer,
    main: mainSlice.reducer,
    alert: alertSlice.reducer,
    logs: logsSlice.reducer,
    ui: uiSlice.reducer,
    navigator: navigatorSlice.reducer,
    uiCoach: uiCoachSlice.reducer,
    extension: extensionSlice.reducer,
  },
  middleware: getDefaultMiddleware => [...getDefaultMiddleware().concat(middlewares), sectionBlueprintMiddleware],
});

// eslint-disable-next-line no-undef
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
