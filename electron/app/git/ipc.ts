import {ipcMain} from 'electron';

import {FileMapType} from '@models/appstate';

import {
  areFoldersGitRepos,
  checkoutGitBranch,
  cloneGitRepo,
  commitChanges,
  createLocalBranch,
  deleteLocalBranch,
  fetchGitRepo,
  getChangedFiles,
  getCurrentBranch,
  initGitRepo,
  isFolderGitRepo,
  publishLocalBranch,
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

ipcMain.on('git.commitChanges', async (event, payload: {localPath: string; message: string}) => {
  await commitChanges(payload.localPath, payload.message);
  event.sender.send('git.commitChanges.result');
});

ipcMain.on('git.deleteLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  await deleteLocalBranch(payload.localPath, payload.branchName);
  event.sender.send('git.deleteLocalBranch.result');
});

ipcMain.on('git.createLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  await createLocalBranch(payload.localPath, payload.branchName);
  event.sender.send('git.createLocalBranch.result');
});

ipcMain.on('git.publishLocalBranch', async (event, payload: {localPath: string; branchName: string}) => {
  await publishLocalBranch(payload.localPath, payload.branchName);
  event.sender.send('git.publishLocalBranch.result');
});

ipcMain.on('git.pushChanges', async (event, payload: {localPath: string; branchName: string}) => {
  await pushChanges(payload.localPath, payload.branchName);
  event.sender.send('git.pushChanges.result');
});

ipcMain.on('git.setRemote', async (event, payload: {localPath: string; remoteURL: string}) => {
  await setRemote(payload.localPath, payload.remoteURL);
  event.sender.send('git.setRemote.result');
});
