import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

import type {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
