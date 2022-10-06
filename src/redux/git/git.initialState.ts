import {GitSliceState} from '@models/git';

export const gitInitialState: GitSliceState = {
  changedFiles: [],
  isGitInstalled: false,
  selectedItem: undefined,
  repo: undefined,
};
