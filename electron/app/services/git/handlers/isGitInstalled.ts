import simpleGit from 'simple-git';

export async function isGitInstalled(): Promise<boolean> {
  const git = simpleGit();

  try {
    const result = await git.version();
    return result.installed;
  } catch (e) {
    return false;
  }
}
