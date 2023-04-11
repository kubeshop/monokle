import {ipcMain} from 'electron';

import type {FileMapType} from '@shared/models/appState';

import {getChangedFiles, getCommitResources, getGitRepoInfo} from './git';

ipcMain.on('git.getGitRepoInfo', async (event, localPath: string) => {
  try {
    const result = await getGitRepoInfo(localPath);
    event.sender.send('git.getGitRepoInfo.result', result);
  } catch (e: any) {
    event.sender.send('git.getGitRepoInfo.result', {error: e.message});
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

ipcMain.on('git.getCommitResources', async (event, payload: {localPath: string; commitHash: string}) => {
  try {
    const result = await getCommitResources(payload.localPath, payload.commitHash);
    event.sender.send('git.getCommitResources.result', result);
  } catch (e: any) {
    event.sender.send('git.getCommitResources.result', {error: e.message});
  }
});
