import {AppDispatch} from './appDispatch';
import {RootState} from './rootState';

export type ThunkApi = {
  dispatch: AppDispatch;
  state: RootState;
};
