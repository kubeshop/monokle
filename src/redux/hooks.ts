import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

import {TypedAddListener, addListener} from '@reduxjs/toolkit';

import {AppDispatch} from '@shared/models/appDispatch';
import {RootState} from '@shared/models/rootState';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const addAppListener = addListener as TypedAddListener<RootState, AppDispatch>;
