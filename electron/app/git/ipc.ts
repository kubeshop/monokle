import {ipcMain} from 'electron';

import {getGitRepoInfo} from './git';

ipcMain.on('git.getGitRepoInfo', async (event, localPath: string) => {
  try {
    const result = await getGitRepoInfo(localPath);
    event.sender.send('git.getGitRepoInfo.result', result);
  } catch (e: any) {
    event.sender.send('git.getGitRepoInfo.result', {error: e.message});
  }
});
