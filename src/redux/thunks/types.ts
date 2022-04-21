import {AppDispatch} from '@models/appdispatch';
import {RootState} from '@models/rootstate';

export type ThunkApi = {
  dispatch: AppDispatch;
  state: RootState;
};
