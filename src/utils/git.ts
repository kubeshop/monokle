import {ipcRenderer} from 'electron';

import path from 'path';

export function filterGitFolder(paths: string[]) {
  return paths.filter(p => p !== '.git' && !p.includes(`${path.sep}.git${path.sep}`) && !p.endsWith('.git'));
}

export function fetchIsGitInstalled() {
  return new Promise<boolean>(resolve => {
    ipcRenderer.once('git.isGitInstalled.result', (_, isGitInstalled) => {
      resolve(isGitInstalled);
    });
    ipcRenderer.send('git.isGitInstalled');
  });
}

export function gitCommitDate(date: string) {
  const newDate = new Date(date);

  return `${newDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })} ${newDate.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}`;
}
