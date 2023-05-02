import {invokeIpc} from '@utils/ipc';

import {
  GitAheadBehindCommitsCountParams,
  GitAheadBehindCommitsCountResult,
  GitBranchCommitsParams,
  GitBranchCommitsResult,
  GitChangedFilesParams,
  GitCheckoutBranchParams,
  GitCloneRepoParams,
  GitCommitChangesParams,
  GitCommitResourcesParams,
  GitCreateDeleteLocalBranchParams,
  GitPathParams,
  GitPublishLocalBranchParams,
  GitPushChangesParams,
  GitSetRemoteParams,
  GitStageUnstageFilesParams,
} from '@shared/ipc/git';
import {GitChangedFile, GitRepo} from '@shared/models/git';

export const checkoutGitBranch = invokeIpc<GitCheckoutBranchParams, void>('git:checkoutGitBranch');
export const cloneGitRepo = invokeIpc<GitCloneRepoParams, void>('git:cloneGitRepo');
export const commitChanges = invokeIpc<GitCommitChangesParams, void>('git:commitChanges');
export const createLocalBranch = invokeIpc<GitCreateDeleteLocalBranchParams, void>('git:createLocalBranch');
export const deleteLocalBranch = invokeIpc<GitCreateDeleteLocalBranchParams, void>('git:deleteLocalBranch');
export const fetchRepo = invokeIpc<GitPathParams, void>('git:fetchRepo');
export const getAheadBehindCommitsCount = invokeIpc<GitAheadBehindCommitsCountParams, GitAheadBehindCommitsCountResult>(
  'git:getAheadBehindCommitsCount'
);
export const getBranchCommits = invokeIpc<GitBranchCommitsParams, GitBranchCommitsResult>('git:getBranchCommits');
export const getChangedFiles = invokeIpc<GitChangedFilesParams, GitChangedFile[]>('git:getChangedFiles');
export const getCommitResources = invokeIpc<GitCommitResourcesParams, Record<string, string>>('git:getCommitResources');
export const getGitRemotePath = invokeIpc<GitPathParams, string>('git:getGitRemotePath');
export const getRepoInfo = invokeIpc<GitPathParams, GitRepo>('git:getRepoInfo');
export const initGitRepo = invokeIpc<GitPathParams, void>('git:initGitRepo');
export const isFolderGitRepo = invokeIpc<GitPathParams, boolean>('git:isFolderGitRepo');
export const isGitInstalled = invokeIpc<{}, boolean>('git:isGitInstalled');
export const publishLocalBranch = invokeIpc<GitPublishLocalBranchParams, void>('git:publishLocalBranch');
export const pullChanges = invokeIpc<GitPathParams, void>('git:pullChanges');
export const pushChanges = invokeIpc<GitPushChangesParams, void>('git:pushChanges');
export const setRemote = invokeIpc<GitSetRemoteParams, void>('git:setRemote');
export const stageChangedFiles = invokeIpc<GitStageUnstageFilesParams, void>('git:stageChangedFiles');
export const unstageFiles = invokeIpc<GitStageUnstageFilesParams, void>('git:unstageFiles');
