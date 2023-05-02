import simpleGit from 'simple-git';

import type {GitChangedFilesParams} from '@shared/ipc/git';
import {GitChangedFile} from '@shared/models/git';

import {formatGitChangedFiles} from '../../../utils/git';

export async function getChangedFiles({localPath, fileMap}: GitChangedFilesParams): Promise<GitChangedFile[]> {
  const git = simpleGit({baseDir: localPath});

  const projectFolderPath = fileMap['<root>'].filePath;

  const [gitFolderPath, branch, branchStatus] = await Promise.all([
    git.revparse({'--show-toplevel': null}),
    git.branch(),
    git.status({'-z': null, '-uall': null}),
  ]);

  const changedFiles = formatGitChangedFiles(branchStatus.files, fileMap, projectFolderPath, gitFolderPath, git);

  for (let i = 0; i < changedFiles.length; i += 1) {
    if (!changedFiles[i].originalContent) {
      let originalContent: string = '';

      try {
        // eslint-disable-next-line no-await-in-loop
        originalContent = await git.show(`${branch.current}:${changedFiles[i].gitPath}`);
      } catch (error) {
        originalContent = '';
      }

      changedFiles[i].originalContent = originalContent;
    }
  }

  return changedFiles;
}
