import {AnyAction, Dispatch, ThunkDispatch} from '@reduxjs/toolkit';

import {RootState} from './rootState';

export type AppDispatch = Dispatch<AnyAction> & ThunkDispatch<RootState, null, AnyAction>;
