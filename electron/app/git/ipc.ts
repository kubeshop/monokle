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
  try {
    const result = await areFoldersGitRepos(paths);
    event.sender.send('git.areFoldersGitRepos.result', result);
  } catch (e: any) {
    event.sender.send('git.areFoldersGitRepos.result', {error: e.message});
  }
});

ipcMain.on('git.isFolderGitRepo', async (event, path: string) => {
  try {
    const result = await isFolderGitRepo(path);
    event.sender.send('git.isFolderGitRepo.result', result);
  } catch (e: any) {
    event.sender.send('git.isFolderGitRepo.result', {error: e.message});
  }
});

ipcMain.on('git.isGitInstalled', async (event, path: string) => {
  try {
    const result = await isGitInstalled(path);
    event.sender.send('git.isGitInstalled.result', result);
  } catch (e: any) {
    event.sender.send('git.isGitInstalled.result', {error: e.message});
  }
});

ipcMain.on('git.cloneGitRepo', async (event, payload: {localPath: string; repoPath: string}) => {
  try {
    const result = await cloneGitRepo(payload);
    event.sender.send('git.cloneGitRepo.result', result);
  } catch (e: any) {
    event.sender.send('git.cloneGitRepo.result', {error: e.message});
  }
});

ipcMain.on('git.getGitRepoInfo', async (event, localPath: string) => {
  try {
    const result = await getGitRepoInfo(localPath);
    event.sender.send('git.getGitRepoInfo.result', result);
  } catch (e: any) {
    event.sender.send('git.getGitRepoInfo.result', {error: e.message});
  }
});

ipcMain.on('git.checkoutGitBranch', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await checkoutGitBranch(payload);
    event.sender.send('git.checkoutGitBranch.result', result);
  } catch (e: any) {
    event.sender.send('git.checkoutGitBranch.result', {error: e.message});
  }
});

ipcMain.on('git.initGitRepo', async (event, localPath: string) => {
  try {
    const result = await initGitRepo(localPath);
    event.sender.send('git.initGitRepo.result', result);
  } catch (e: any) {
    event.sender.send('git.initGitRepo.result', {error: e.message});
  }
});

ipcMain.on('git.getChangedFiles', async (event, payload: {localPath: string; fileMap: FileMapType}) => {
  try {
    const result = await getChangedFiles(payload.localPath, payload.fileMap);
    event.sender.send('git.getChangedFiles.result', result);
  } catch (e: any) {
    event.sender.send('git.getChangedFiles.result', {error: e.message});
  }
});

ipcMain.on('git.stageChangedFiles', async (event, payload: {localPath: string; filePaths: string[]}) => {
  const {filePaths, localPath} = payload;

  try {
    const result = await stageChangedFiles(localPath, filePaths);
    event.sender.send('git.stageChangedFiles.result', result);
  } catch (e: any) {
    event.sender.send('git.stageChangedFiles.result', {error: e.message});
  }
});

ipcMain.on('git.unstageFiles', async (event, payload: {localPath: string; filePaths: string[]}) => {
  const {filePaths, localPath} = payload;

  try {
    const result = await unstageFiles(localPath, filePaths);
    event.sender.send('git.unstageFiles.result', result);
  } catch (e: any) {
    event.sender.send('git.unstageFiles.result', {error: e.message});
  }
});

ipcMain.on('git.commitChanges', async (event, payload: {localPath: string; message: string}) => {
  try {
    const result = await commitChanges(payload.localPath, payload.message);
    event.sender.send('git.commitChanges.result', result);
  } catch (e: any) {
    event.sender.send('git.commitChanges.result', {error: e.message});
  }
});

ipcMain.on('git.deleteLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await deleteLocalBranch(payload.localPath, payload.branchName);
    event.sender.send('git.deleteLocalBranch.result', result);
  } catch (e: any) {
    event.sender.send('git.deleteLocalBranch.result', {error: e.message});
  }
});

ipcMain.on('git.createLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await createLocalBranch(payload.localPath, payload.branchName);
    event.sender.send('git.createLocalBranch.result', result);
  } catch (e: any) {
    event.sender.send('git.createLocalBranch.result', {error: e.message});
  }
});

ipcMain.on('git.publishLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await publishLocalBranch(payload.localPath, payload.branchName);
    event.sender.send('git.publishLocalBranch.result', result);
  } catch (e: any) {
    event.sender.send('git.publishLocalBranch.result', {error: e.message});
  }
});

ipcMain.on('git.pushChanges', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await pushChanges(payload.localPath, payload.branchName);
    event.sender.send('git.pushChanges.result', result);
  } catch (e: any) {
    event.sender.send('git.pushChanges.result', {error: e.message});
  }
});

ipcMain.on('git.setRemote', async (event, payload: {localPath: string; remoteURL: string}) => {
  try {
    const result = await setRemote(payload.localPath, payload.remoteURL);
    event.sender.send('git.setRemote.result', result);
  } catch (e: any) {
    event.sender.send('git.setRemote.result', {error: e.message});
  }
});

ipcMain.on('git.getRemotePath', async (event, localPath: string) => {
  try {
    const result = await getRemotePath(localPath);
    event.sender.send('git.getRemotePath.result', result);
  } catch (e: any) {
    event.sender.send('git.getRemotePath.result', {error: e.message});
  }
});

ipcMain.on('git.getCommitsCount', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await getCommitsCount(payload.localPath, payload.branchName);
    event.sender.send('git.getCommitsCount.result', result);
  } catch (e: any) {
    event.sender.send('git.getCommitsCount.result', {error: e.message});
  }
});

ipcMain.on('git.fetchRepo', async (event, localPath: string) => {
  try {
    const result = await fetchRepo(localPath);
    event.sender.send('git.fetchRepo.result', result);
  } catch (e: any) {
    event.sender.send('git.fetchRepo.result', {error: e.message});
  }
});

ipcMain.on('git.pullChanges', async (event, localPath: string) => {
  try {
    const result = await pullChanges(localPath);
    event.sender.send('git.pullChanges.result', result);
  } catch (e: any) {
    event.sender.send('git.pullChanges.result', {error: e.message});
  }
});

ipcMain.on('git.getCommitResources', async (event, payload: {localPath: string; commitHash: string}) => {
  try {
    const result = await getCommitResources(payload.localPath, payload.commitHash);
    event.sender.send('git.getCommitResources.result', result);
  } catch (e: any) {
    event.sender.send('git.getCommitResources.result', {error: e.message});
  }
});

ipcMain.on('git.getBranchCommits', async (event, payload: {localPath: string; branchName: string}) => {
  try {
    const result = await getBranchCommits(payload.localPath, payload.branchName);
    event.sender.send('git.getBranchCommits.result', result);
  } catch (e: any) {
    event.sender.send('git.getBranchCommits.result', {error: e.message});
  }
});
