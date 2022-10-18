import {ipcRenderer} from 'electron';

import fs from 'fs';
import path from 'path';

import {FileMapType} from '@models/appstate';
import {GitChangedFile, GitChangedFileType} from '@models/git';

const gitFileType: {
  [type: string]: GitChangedFileType;
} = {
  A: 'added',
  D: 'deleted',
  M: 'modified',
  R: 'renamed',
  C: 'conflict',
  S: 'submodule',
  '?': 'untracked',
};

export function formatGitChangedFiles(
  files: {path: string; index: string; working_dir: string}[],
  fileMap: FileMapType,
  projectFolderPath: string,
  gitFolderPath: string
): GitChangedFile[] {
  let changedFiles: GitChangedFile[] = [];

  files.forEach(gitFile => {
    const workingDirStatus = gitFile.working_dir.trim();
    const indexStatus = gitFile.index.trim();

    const fileType = gitFile.index.trim() ? gitFileType[gitFile.index] : gitFileType[gitFile.working_dir];

    const foundFile = Object.values(fileMap).find(
      f => path.join(projectFolderPath, f.filePath) === path.join(gitFolderPath, gitFile.path)
    );

    let modifiedContent = foundFile?.text || '';

    if (!modifiedContent && fileType !== 'deleted') {
      modifiedContent = fs.readFileSync(path.join(gitFolderPath, gitFile.path), 'utf8');
    }

    const fullGitPath = path.join(gitFolderPath, gitFile.path);

    const relativePath = path.dirname(fullGitPath.replace(`${projectFolderPath}${path.sep}`, ''));
    const filePath = relativePath === '.' ? '' : relativePath;
    const status =
      workingDirStatus && indexStatus && indexStatus !== '?' ? 'staged' : workingDirStatus ? 'unstaged' : 'staged';

    changedFiles.push({
      status,
      modifiedContent,
      name: foundFile?.name || gitFile.path.split('/').pop() || '',
      gitPath: gitFile.path,
      fullGitPath,
      path: fullGitPath.replace(projectFolderPath, ''),
      displayPath: path.join(gitFolderPath, gitFile.path).startsWith(projectFolderPath)
        ? filePath
        : path.join(gitFolderPath, gitFile.path),
      originalContent: '',
      type: fileType,
    });
  });

  return changedFiles;
}

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
