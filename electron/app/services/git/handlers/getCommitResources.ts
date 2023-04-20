import simpleGit from 'simple-git';

import type {GitCommitResourcesParams} from '@shared/ipc/git';
import {isHelmChartFile, isHelmTemplateFile, isHelmValuesFile} from '@shared/utils/helm';
import {isKustomizationFilePath} from '@shared/utils/kustomize';

export async function getCommitResources({
  commitHash,
  localPath,
}: GitCommitResourcesParams): Promise<Record<string, string>> {
  const git = simpleGit({baseDir: localPath});
  let filesContent: Record<string, string> = {};

  const filesPaths = (await git.raw('ls-tree', '-r', '--name-only', commitHash))
    .split('\n')
    .filter(
      el =>
        (el.includes('.yaml') || el.includes('.yml')) &&
        !isKustomizationFilePath(el) &&
        !isHelmTemplateFile(el) &&
        !isHelmChartFile(el) &&
        !isHelmValuesFile(el)
    );

  for (let i = 0; i < filesPaths.length; i += 1) {
    let content: string;

    // get the content of the file found in current branch
    try {
      content = await git.show(`${commitHash}:${filesPaths[i]}`);
    } catch (e) {
      content = '';
    }

    if (content) {
      filesContent[filesPaths[i]] = content;
    }
  }

  return filesContent;
}
