import {CompareState} from '@monokle-desktop/shared/models';

export const initialState: CompareState = {
  current: {
    view: {
      operation: 'union',
      leftSet: undefined,
      rightSet: undefined,
    },
    selection: [],
    transfering: {
      pending: false,
    },
  },
};
