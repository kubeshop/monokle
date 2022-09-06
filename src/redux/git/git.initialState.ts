import {GitChangedFile, GitSliceState} from '@models/git';

export const gitInitialState: GitSliceState = {
  selectedItem: {} as GitChangedFile,
  changedFiles: [],
  repo: undefined,
};
