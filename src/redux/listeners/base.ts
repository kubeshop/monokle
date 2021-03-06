import {TypedStartListening, createListenerMiddleware} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;
export type AppListenerFn = (listen: AppStartListening) => void;

export function combineListeners(listeners: AppListenerFn[]) {
  listeners.forEach(listenerFn => listenerFn(startAppListening));
}
