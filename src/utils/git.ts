import {FileMapType} from '@models/appstate';
import {GitChangedFile} from '@models/git';

export function formatGitChangedFiles(result: any, fileMap: FileMapType): GitChangedFile[] {
  const {unstagedChangedFiles, stagedChangedFiles} = result;

  const changedFiles: GitChangedFile[] = [
    ...stagedChangedFiles.map((file: any) => ({
      status: 'staged',
      name: file,
      path: Object.values(fileMap).find(f => f.name === file)?.filePath,
    })),
    ...unstagedChangedFiles.map((file: any) => ({
      status: 'unstaged',
      name: file,
      path: Object.values(fileMap).find(f => f.name === file)?.filePath,
    })),
  ];

  return changedFiles;
}
