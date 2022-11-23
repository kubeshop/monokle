import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

import {AppDispatch} from '@monokle-desktop/shared/models/appDispatch';
import {RootState} from '@monokle-desktop/shared/models/rootState';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
