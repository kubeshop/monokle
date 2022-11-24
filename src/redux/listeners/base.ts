import {TypedStartListening, createListenerMiddleware} from '@reduxjs/toolkit';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;
export type AppListenerFn = (listen: AppStartListening) => void;

export function combineListeners(listeners: AppListenerFn[]) {
  listeners.forEach(listenerFn => listenerFn(startAppListening));
}
