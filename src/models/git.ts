export type GitBranch = {
  name: string;
  commitSha: string;
};

export type GitRepo = {
  currentBranch: string;
  branches: string[];
  branchMap: Record<string, GitBranch>;
};

export type GitChangedFile = {
  modifiedContent: string;
  name: string;
  originalContent: string;
  path: string;
  status: 'staged' | 'unstaged';
};

export type GitSliceState = {
  changedFiles: GitChangedFile[];
  selectedItem?: GitChangedFile;
  repo?: GitRepo;
};
