import {GitSliceState} from '@monokle-desktop/shared/models';

export const gitInitialState: GitSliceState = {
  changedFiles: [],
  gitCloneModal: {open: false},
  isGitInstalled: false,
  loading: false,
  selectedItem: undefined,
  repo: undefined,
};
