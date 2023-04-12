import simpleGit from 'simple-git';

import type {GitChangedFilesParams} from '@shared/ipc/git';
import {GitChangedFile} from '@shared/models/git';

import {formatGitChangedFiles} from '../../../utils/git';

export async function getChangedFiles({localPath, fileMap}: GitChangedFilesParams): Promise<GitChangedFile[]> {
  const git = simpleGit({baseDir: localPath});

  const projectFolderPath = fileMap['<root>'].filePath;

  try {
    const gitFolderPath = await git.revparse({'--show-toplevel': null});
    const currentBranch = (await git.branch()).current;
    const branchStatus = await git.status({'-z': null, '-uall': null});
    const files = branchStatus.files;

    const changedFiles = formatGitChangedFiles(files, fileMap, projectFolderPath, gitFolderPath, git);

    for (let i = 0; i < changedFiles.length; i += 1) {
      if (!changedFiles[i].originalContent) {
        let originalContent: string = '';

        try {
          // eslint-disable-next-line no-await-in-loop
          originalContent = await git.show(`${currentBranch}:${changedFiles[i].gitPath}`);
        } catch (error) {
          originalContent = '';
        }

        changedFiles[i].originalContent = originalContent;
      }
    }

    return changedFiles;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
