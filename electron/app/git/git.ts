import {promises as fs} from 'fs';
import {SimpleGit, simpleGit} from 'simple-git';

export async function isFolderGitRepo(path: string) {
  const git: SimpleGit = simpleGit({baseDir: path});
  try {
    await git.status();
    return true;
  } catch (e) {
    return false;
  }
}

export async function cloneGitRepo(payload: {localPath: string; repoPath: string}) {
  const {localPath, repoPath} = payload;
  try {
    const stat = await fs.stat(localPath);
    if (!stat.isDirectory()) {
      throw new Error(`${localPath} is ot a directory`);
    }
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      fs.mkdir(localPath);
    } else {
      throw e;
    }
  }
  const git: SimpleGit = simpleGit({baseDir: localPath});
  await git.clone(repoPath, localPath);
}
