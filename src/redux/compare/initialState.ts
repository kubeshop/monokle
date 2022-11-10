import {CompareState} from '@monokle-desktop/shared';

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
