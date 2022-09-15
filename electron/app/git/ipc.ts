import {ipcMain} from 'electron';

import {FileMapType} from '@models/appstate';

import {
  areFoldersGitRepos,
  checkoutGitBranch,
  cloneGitRepo,
  fetchGitRepo,
  getChangedFiles,
  getCurrentBranch,
  initGitRepo,
  isFolderGitRepo,
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

ipcMain.on('git.cloneGitRepo', async (event, payload: {localPath: string; repoPath: string}) => {
  // TODO: handle errors
  await cloneGitRepo(payload);
  event.sender.send('git.cloneGitRepo.result');
});

ipcMain.on('git.fetchGitRepo', async (event, localPath: string) => {
  const result = await fetchGitRepo(localPath);
  event.sender.send('git.fetchGitRepo.result', result);
});

ipcMain.on('git.checkoutGitBranch', async (event, payload: {localPath: string; branchName: string}) => {
  await checkoutGitBranch(payload);
  event.sender.send('git.checkoutGitBranch.result');
});

ipcMain.on('git.initGitRepo', async (event, localPath: string) => {
  await initGitRepo(localPath);
  event.sender.send('git.initGitRepo.result');
});

ipcMain.on('git.getChangedFiles', async (event, payload: {localPath: string; fileMap: FileMapType}) => {
  const result = await getChangedFiles(payload.localPath, payload.fileMap);
  event.sender.send('git.getChangedFiles.result', result);
});

ipcMain.on('git.getCurrentBranch', async (event, localPath: string) => {
  const result = await getCurrentBranch(localPath);
  event.sender.send('git.getCurrentBranch.result', result);
});

ipcMain.on('git.stageChangedFiles', async (event, payload: {localPath: string; filePaths: string[]}) => {
  const {filePaths, localPath} = payload;

  await stageChangedFiles(localPath, filePaths);
  event.sender.send('git.stageChangedFiles.result');
});

ipcMain.on('git.unstageFiles', async (event, payload: {localPath: string; filePaths: string[]}) => {
  const {filePaths, localPath} = payload;

  await unstageFiles(localPath, filePaths);
  event.sender.send('git.unstageFiles.result');
});
