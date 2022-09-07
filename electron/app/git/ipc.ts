import {ipcMain} from 'electron';

import {checkoutGitBranch, cloneGitRepo, fetchGitRepo, initGitRepo, isFolderGitRepo} from './git';

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
