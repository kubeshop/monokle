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
  name: string;
  path: string;
};

export type GitSliceState = {
  changedFiles: GitChangedFile[];
  repo?: GitRepo;
};
