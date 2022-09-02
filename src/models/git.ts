export type GitBranch = {
  name: string;
  commitSha: string;
};

export type GitRepo = {
  currentBranch: string;
  branches: string[];
  branchMap: Record<string, GitBranch>;
};

export type GitSliceState = {
  selectedItem?: boolean;
  repo?: GitRepo;
};
