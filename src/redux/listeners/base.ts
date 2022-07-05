import {TypedStartListening, TypedStopListening, createListenerMiddleware} from '@reduxjs/toolkit';

import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<RootState, AppDispatch>;
export type AppStopListening = TypedStopListening<RootState, AppDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;
export const stopAppListening = listenerMiddleware.stopListening as AppStopListening;
export type AppListenerFn = (startListening: AppStartListening, stopListening: AppStopListening) => void;

export function combineListeners(listeners: AppListenerFn[]) {
  listeners.forEach(listenerFn => listenerFn(startAppListening, stopAppListening));
}

export function registerListener(listener: AppListenerFn) {
  listener(startAppListening, stopAppListening);
}
