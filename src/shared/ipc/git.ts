import {DefaultLogFields, ListLogLine} from 'simple-git';

type LocalPathBranchNameParams = {
  localPath: string;
  branchName: string;
};

export type GitCloneRepoParams = {
  localPath: string;
  repoPath: string;
};

export type GitPathParams = {
  path: string;
};

export type GitAheadBehindCommitsCountParams = {
  localPath: string;
  currentBranch: string;
};

export type GitAheadBehindCommitsCountResult = {
  aheadCount: number;
  behindCount: number;
};

export type GitCheckoutBranchParams = LocalPathBranchNameParams;
export type GitPushChangesParams = LocalPathBranchNameParams;
export type GitBranchCommitsParams = LocalPathBranchNameParams;

export type GitBranchCommitsResult = (DefaultLogFields & ListLogLine)[];
