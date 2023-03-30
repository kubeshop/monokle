import {ipcMain} from 'electron';

import type {FileMapType} from '@shared/models/appState';

import {
  areFoldersGitRepos,
  checkoutGitBranch,
  cloneGitRepo,
  commitChanges,
  createLocalBranch,
  deleteLocalBranch,
  fetchRepo,
  getBranchCommits,
  getChangedFiles,
  getCommitResources,
  getCommitsCount,
  getGitRemoteUrl,
  getGitRepoInfo,
  getRemotePath,
  initGitRepo,
  isFolderGitRepo,
  isGitInstalled,
  publishLocalBranch,
  pullChanges,
  pushChanges,
  setRemote,
  stageChangedFiles,
  unstageFiles,
} from './git';

ipcMain.on('git.areFoldersGitRepos', async (event, paths: string[]) => {
  const result = await areFoldersGitRepos(paths);
  event.sender.send('git.areFoldersGitRepos.result', result);
});

ipcMain.on('git.isFolderGitRepo', async (event, path: string) => {
  const result = await isFolderGitRepo(path);
  event.sender.send('git.isFolderGitRepo.result', result);
});

ipcMain.on('git.isGitInstalled', async (event, path: string) => {
  const result = await isGitInstalled(path);
  event.sender.send('git.isGitInstalled.result', result);
});

ipcMain.on('git.cloneGitRepo', async (event, payload: {localPath: string; repoPath: string}) => {
  const result = await cloneGitRepo(payload);
  event.sender.send('git.cloneGitRepo.result', result);
});

ipcMain.on('git.getGitRemoteUrl', async (event, path: string) => {
  const result = await getGitRemoteUrl(path);
  event.sender.send('git.getGitRemoteUrl.result', result);
});

ipcMain.on('git.getGitRepoInfo', async (event, localPath: string) => {
  const result = await getGitRepoInfo(localPath);
  event.sender.send('git.getGitRepoInfo.result', result);
});

ipcMain.on('git.checkoutGitBranch', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await checkoutGitBranch(payload);
  event.sender.send('git.checkoutGitBranch.result', result);
});

ipcMain.on('git.initGitRepo', async (event, localPath: string) => {
  const result = await initGitRepo(localPath);
  event.sender.send('git.initGitRepo.result', result);
});

ipcMain.on('git.getChangedFiles', async (event, payload: {localPath: string; fileMap: FileMapType}) => {
  const result = await getChangedFiles(payload.localPath, payload.fileMap);
  event.sender.send('git.getChangedFiles.result', result);
});

ipcMain.on('git.stageChangedFiles', async (event, payload: {localPath: string; filePaths: string[]}) => {
  const {filePaths, localPath} = payload;

  const result = await stageChangedFiles(localPath, filePaths);
  event.sender.send('git.stageChangedFiles.result', result);
});

ipcMain.on('git.unstageFiles', async (event, payload: {localPath: string; filePaths: string[]}) => {
  const {filePaths, localPath} = payload;

  const result = await unstageFiles(localPath, filePaths);
  event.sender.send('git.unstageFiles.result', result);
});

ipcMain.on('git.commitChanges', async (event, payload: {localPath: string; message: string}) => {
  const result = await commitChanges(payload.localPath, payload.message);
  event.sender.send('git.commitChanges.result', result);
});

ipcMain.on('git.deleteLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await deleteLocalBranch(payload.localPath, payload.branchName);
  event.sender.send('git.deleteLocalBranch.result', result);
});

ipcMain.on('git.createLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await createLocalBranch(payload.localPath, payload.branchName);
  event.sender.send('git.createLocalBranch.result', result);
});

ipcMain.on('git.publishLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await publishLocalBranch(payload.localPath, payload.branchName);
  event.sender.send('git.publishLocalBranch.result', result);
});

ipcMain.on('git.pushChanges', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await pushChanges(payload.localPath, payload.branchName);
  event.sender.send('git.pushChanges.result', result);
});

ipcMain.on('git.setRemote', async (event, payload: {localPath: string; remoteURL: string}) => {
  const result = await setRemote(payload.localPath, payload.remoteURL);
  event.sender.send('git.setRemote.result', result);
});

ipcMain.on('git.getRemotePath', async (event, localPath: string) => {
  const result = await getRemotePath(localPath);
  event.sender.send('git.getRemotePath.result', result);
});

ipcMain.on('git.getCommitsCount', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await getCommitsCount(payload.localPath, payload.branchName);
  event.sender.send('git.getCommitsCount.result', result);
});

ipcMain.on('git.fetchRepo', async (event, localPath: string) => {
  const result = await fetchRepo(localPath);
  event.sender.send('git.fetchRepo.result', result);
});

ipcMain.on('git.pullChanges', async (event, localPath: string) => {
  const result = await pullChanges(localPath);
  event.sender.send('git.pullChanges.result', result);
});

ipcMain.on('git.getCommitResources', async (event, payload: {localPath: string; commitHash: string}) => {
  const result = await getCommitResources(payload.localPath, payload.commitHash);
  event.sender.send('git.getCommitResources.result', result);
});

ipcMain.on('git.getBranchCommits', async (event, payload: {localPath: string; branchName: string}) => {
  const result = await getBranchCommits(payload.localPath, payload.branchName);
  event.sender.send('git.getBranchCommits.result', result);
});
