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

      return {
        status: 'staged',
        modifiedContent: foundFile?.text || '',
        name: foundFile?.name || file.split('/').pop(),
        path: file,
      };
    }),
    ...unstagedChangedFiles.map((file: any) => {
      const foundFile = Object.values(fileMap).find(
        f => path.join(projectFolderPath, f.filePath) === path.join(gitFolderPath, file)
      );

      return {
        status: 'unstaged',
        modifiedContent: foundFile?.text || '',
        name: foundFile?.name || file.split('/').pop(),
        path: file,
      };
    }),
  ];

  return changedFiles;
}
