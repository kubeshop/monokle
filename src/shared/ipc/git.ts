export type GitCloneRepoParams = {
  localPath: string;
  repoPath: string;
};

export type GitPathParams = {
  path: string;
};

export type GitCheckoutBranchParams = {
  localPath: string;
  branchName: string;
};

export type GitPushChangesParams = {
  localPath: string;
  branchName: string;
};

export type GitAheadBehindCommitsCountParams = {
  localPath: string;
  currentBranch: string;
};

export type GitAheadBehindCommitsCountResult = {
  aheadCount: number;
  behindCount: number;
};
