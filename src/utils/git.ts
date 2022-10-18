import {ipcRenderer} from 'electron';

import fs from 'fs';
import path from 'path';
import {SimpleGit} from 'simple-git';

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
  gitFolderPath: string,
  git: SimpleGit
): GitChangedFile[] {
  let changedFiles: GitChangedFile[] = [];

  files.forEach(async gitFile => {
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

    const newChangedFile: GitChangedFile = {
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
    };

    // both staged/unstaged changes
    if (workingDirStatus && indexStatus && indexStatus !== '?') {
      const stagedContent = await git.show(`:${gitFile.path}`);

      // unstaged file
      changedFiles.push({...newChangedFile, status: 'unstaged', originalContent: stagedContent});

      // staged file
      changedFiles.push({...newChangedFile, modifiedContent: stagedContent});
    } else {
      changedFiles.push(newChangedFile);
    }
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
