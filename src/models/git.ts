export type GitBranch = {
  name: string;
  commitSha: string;
  type: 'local' | 'remote';
};

export type GitRepo = {
  currentBranch: string;
  branches: string[];
  branchMap: Record<string, GitBranch>;
};

export type GitSliceState = {
  repo?: GitRepo;
};
