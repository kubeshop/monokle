import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

import {AppDispatch, RootState} from '@monokle-desktop/shared/models';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
