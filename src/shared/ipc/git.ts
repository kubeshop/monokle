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

export type GitStageUnstageFilesParams = {
  localPath: string;
  filePaths: string[];
};

export type GitCommitChangesParams = {
  localPath: string;
  message: string;
};

export type GitAheadBehindCommitsCountParams = LocalPathBranchNameParams;
export type GitBranchCommitsParams = LocalPathBranchNameParams;
export type GitCheckoutBranchParams = LocalPathBranchNameParams;
export type GitCreateDeleteLocalBranchParams = LocalPathBranchNameParams;
export type GitPublishLocalBranchParams = LocalPathBranchNameParams;
export type GitPushChangesParams = LocalPathBranchNameParams;

export type GitAheadBehindCommitsCountResult = {
  aheadCount: number;
  behindCount: number;
};

export type GitBranchCommitsResult = (DefaultLogFields & ListLogLine)[];
