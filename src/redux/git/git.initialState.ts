import {GitSliceState} from '@models/git';

export const gitInitialState: GitSliceState = {
  selectedItem: false,
  changedFiles: [],
  repo: undefined,
};
