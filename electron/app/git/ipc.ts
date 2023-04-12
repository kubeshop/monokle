import {ipcMain} from 'electron';

import type {FileMapType} from '@shared/models/appState';

import {getChangedFiles, getGitRepoInfo} from './git';

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
