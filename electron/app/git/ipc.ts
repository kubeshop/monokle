import {ipcMain} from 'electron';

import {cloneGitRepo, isFolderGitRepo} from './git';

ipcMain.on('git.isFolderGitRepo', async (event, path: string) => {
  const result = await isFolderGitRepo(path);
  event.sender.send('git.isFolderGitRepo.result', result);
});

ipcMain.on('git.cloneGitRepo', async (event, payload: {localPath: string; repoPath: string}) => {
  // TODO: handle errors
  await cloneGitRepo(payload);
  event.sender.send('git.cloneGitRepo.result');
});
