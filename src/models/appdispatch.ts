import {AnyAction, Dispatch, ThunkDispatch} from '@reduxjs/toolkit';

import {RootState} from './rootstate';

export type AppDispatch = Dispatch<AnyAction> & ThunkDispatch<RootState, null, AnyAction>;
