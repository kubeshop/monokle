import {GitSliceState} from '@models/git';

export const gitInitialState: GitSliceState = {
  selectedItem: {},
  changedFiles: [],
  repo: undefined,
};
