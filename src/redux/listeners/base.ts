import {AnyAction, Dispatch, ThunkDispatch, TypedStartListening, createListenerMiddleware} from '@reduxjs/toolkit';

import type {CompareState} from '@redux/reducers/compare';

type PartialState = {
  compare: CompareState;
};

type PartialDispatch = Dispatch<AnyAction> & ThunkDispatch<PartialState, null, AnyAction>;

export const listenerMiddleware = createListenerMiddleware();
export type AppStartListening = TypedStartListening<PartialState, PartialDispatch>;
export const startAppListening = listenerMiddleware.startListening as AppStartListening;
