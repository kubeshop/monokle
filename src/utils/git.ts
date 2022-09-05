import path from 'path';

import {FileMapType} from '@models/appstate';
import {GitChangedFile} from '@models/git';

export function formatGitChangedFiles(result: any, fileMap: FileMapType): GitChangedFile[] {
  const {unstagedChangedFiles, stagedChangedFiles} = result;

  const changedFiles: GitChangedFile[] = [
    ...stagedChangedFiles.map((file: any) => {
      const foundFile = Object.values(fileMap).find(f => f.filePath.substring(1) === file.replaceAll('/', path.sep));

      return {
        status: 'staged',
        modifiedContent: foundFile?.text,
        name: foundFile?.name,
        path: file,
      };
    }),
    ...unstagedChangedFiles.map((file: any) => {
      const foundFile = Object.values(fileMap).find(f => f.filePath.substring(1) === file.replaceAll('/', path.sep));

      return {
        status: 'unstaged',
        modifiedContent: foundFile?.text,
        name: foundFile?.name,
        path: file,
      };
    }),
  ];

  return changedFiles;
}
