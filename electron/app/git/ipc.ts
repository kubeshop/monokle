import {ipcMain} from 'electron';

import type {FileMapType} from '@shared/models/appState';

import {
  commitChanges,
  createLocalBranch,
  getChangedFiles,
  getCommitResources,
  getGitRepoInfo,
  initGitRepo,
  publishLocalBranch,
  setRemote,
} from './git';

ipcMain.on('git.getGitRepoInfo', async (event, localPath: string) => {
  try {
    const result = await getGitRepoInfo(localPath);
    event.sender.send('git.getGitRepoInfo.result', result);
  } catch (e: any) {
    event.sender.send('git.getGitRepoInfo.result', {error: e.message});
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

ipcMain.on('git.commitChanges', async (event, payload: {localPath: string; message: string}) => {
  try {
    const result = await commitChanges(payload.localPath, payload.message);
    event.sender.send('git.commitChanges.result', result);
  } catch (e: any) {
    event.sender.send('git.commitChanges.result', {error: e.message});
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

ipcMain.on('git.setRemote', async (event, payload: {localPath: string; remoteURL: string}) => {
  try {
    const result = await setRemote(payload.localPath, payload.remoteURL);
    event.sender.send('git.setRemote.result', result);
  } catch (e: any) {
    event.sender.send('git.setRemote.result', {error: e.message});
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
