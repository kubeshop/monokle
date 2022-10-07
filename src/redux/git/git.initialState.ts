import {GitSliceState} from '@models/git';

export const gitInitialState: GitSliceState = {
  changedFiles: [],
  gitCloneModal: {open: false},
  isGitInstalled: false,
  selectedItem: undefined,
  repo: undefined,
};
