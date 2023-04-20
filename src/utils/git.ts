import {shell} from 'electron';

import {useCallback, useMemo} from 'react';

import path from 'path';

import {useAppSelector} from '@redux/hooks';

export function filterGitFolder(paths: string[]) {
  return paths.filter(p => p !== '.git' && !p.includes(`${path.sep}.git${path.sep}`) && !p.endsWith('.git'));
}

export function gitCommitDate(date: string) {
  const newDate = new Date(date);

  return `${newDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })} ${newDate.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}`;
}

export function openGithubPath(payload: {repoRemoteUrl: string; repoCurrentBranch: string; relativePath: string}) {
  const {repoRemoteUrl, repoCurrentBranch, relativePath} = payload;
  shell.openExternal(`${repoRemoteUrl}/tree/${repoCurrentBranch}${relativePath}`);
}

export function useOpenOnGithub(relativePath?: string) {
  const repoRemoteUrl = useAppSelector(state => state.git.repo?.remoteUrl);
  const repoCurrentBranch = useAppSelector(state => state.git.repo?.currentBranch);

  const canOpenOnGithub = useMemo(
    () => Boolean(repoRemoteUrl && repoCurrentBranch && relativePath),
    [repoRemoteUrl, repoCurrentBranch, relativePath]
  );

  const openOnGithub = useCallback(() => {
    if (repoRemoteUrl && repoCurrentBranch && relativePath) {
      openGithubPath({repoRemoteUrl, repoCurrentBranch, relativePath});
    }
  }, [repoRemoteUrl, repoCurrentBranch, relativePath]);

  return {
    openOnGithub,
    canOpenOnGithub,
  };
}
