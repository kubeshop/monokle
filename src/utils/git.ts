import fs from 'fs';
import path from 'path';

import {FileMapType} from '@models/appstate';
import {GitChangedFile} from '@models/git';

const gitFileType: {[type: string]: 'added' | 'deleted' | 'modified' | 'untracked'} = {
  A: 'added',
  D: 'deleted',
  M: 'modified',
  '?': 'untracked',
};

export function formatGitChangedFiles(
  files: {path: string; index: string; working_dir: string}[],
  fileMap: FileMapType,
  projectFolderPath: string,
  gitFolderPath: string
): GitChangedFile[] {
  const changedFiles: GitChangedFile[] = files.map(gitFile => {
    const fileType = gitFile.index.trim() ? gitFileType[gitFile.index] : gitFileType[gitFile.working_dir];

    const foundFile = Object.values(fileMap).find(
      f => path.join(projectFolderPath, f.filePath) === path.join(gitFolderPath, gitFile.path)
    );

    let modifiedContent = foundFile?.text || '';

    if (!modifiedContent && fileType !== 'deleted') {
      modifiedContent = fs.readFileSync(path.join(gitFolderPath, gitFile.path), 'utf8');
    }

    const relativePath = path.dirname(
      path.join(gitFolderPath, gitFile.path).replace(`${projectFolderPath}${path.sep}`, '')
    );
    const filePath = relativePath === '.' ? '' : relativePath;

    return {
      status:
        gitFile.working_dir.trim() && gitFile.index.trim() && gitFile.index !== '?'
          ? 'staged'
          : gitFile.working_dir.trim()
          ? 'unstaged'
          : 'staged',
      modifiedContent,
      name: foundFile?.name || gitFile.path.split('/').pop() || '',
      gitPath: gitFile.path,
      path: path.join(gitFolderPath, gitFile.path).startsWith(projectFolderPath)
        ? filePath
        : path.join(gitFolderPath, filePath),
      originalContent: '',
      type: fileType,
    };
  });

  return changedFiles;
}
