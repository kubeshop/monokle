import fs from 'fs';
import path from 'path';

import {FileMapType} from '@models/appstate';
import {GitChangedFile} from '@models/git';

export function formatGitChangedFiles(
  result: any,
  fileMap: FileMapType,
  projectFolderPath: string,
  gitFolderPath: string
): GitChangedFile[] {
  const {unstagedChangedFiles, stagedChangedFiles} = result;

  const changedFiles: GitChangedFile[] = [
    ...stagedChangedFiles.map((file: any) => {
      const foundFile = Object.values(fileMap).find(
        f => path.join(projectFolderPath, f.filePath) === path.join(gitFolderPath, file)
      );

      let modifiedContent = foundFile?.text || '';

      if (!modifiedContent && foundFile) {
        modifiedContent = fs.readFileSync(path.join(projectFolderPath, foundFile.filePath), 'utf8');
      }

      return {
        status: 'staged',
        modifiedContent,
        name: foundFile?.name || file.split('/').pop(),
        path: file,
      };
    }),
    ...unstagedChangedFiles.map((file: any) => {
      const foundFile = Object.values(fileMap).find(
        f => path.join(projectFolderPath, f.filePath) === path.join(gitFolderPath, file)
      );

      let modifiedContent = foundFile?.text || '';

      if (!modifiedContent && foundFile) {
        modifiedContent = fs.readFileSync(path.join(projectFolderPath, foundFile.filePath), 'utf8');
      }

      return {
        status: 'unstaged',
        modifiedContent,
        name: foundFile?.name || file.split('/').pop(),
        path: file,
      };
    }),
  ];

  return changedFiles;
}
