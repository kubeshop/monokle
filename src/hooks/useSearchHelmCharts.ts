import {useAsync} from 'react-use';

import {runCommandInMainThread, searchHelmHubCommand, searchHelmRepoCommand} from '@shared/utils/commands';

export const useSearchHelmCharts = (helmRepoSearch: string, includeHubSearch: boolean) => {
  const {
    value: repoResult = [],
    error,
    loading,
  } = useAsync(async (): Promise<ChartInfo[]> => {
    const result = await runCommandInMainThread(searchHelmRepoCommand({q: helmRepoSearch}));
    if (result.stderr) {
      throw new Error(result.stderr);
    }

    return JSON.parse(result.stdout || '[]');
  }, [helmRepoSearch]);

  const {value: hubResult = []} = useAsync(async (): Promise<ChartInfo[]> => {
    if (!includeHubSearch || helmRepoSearch.length <= 0) {
      return [];
    }
    const result = await runCommandInMainThread(searchHelmHubCommand({q: helmRepoSearch}));
    if (result.stderr) {
      throw new Error(result.stderr);
    }
    const data = JSON.parse(result.stdout || '[]') as ChartInfo[];
    const repoResultNames = repoResult.map(item => item.name);
    return data
      .filter(i => i.url)
      .map((item: any) => ({...item, name: extractChartName(item), isHubSearch: true}))
      .filter(item => !repoResultNames.includes(item.name));
  }, [helmRepoSearch, includeHubSearch]);

  return {result: [...repoResult, ...hubResult], error, loading};
};

const extractChartName = (item: ChartInfo) => {
  const urlPath = item?.url?.split('/') || ['', ''];
  return `${urlPath[urlPath.length - 2]}/${urlPath[urlPath.length - 1]}`;
};

export interface ChartInfo {
  name: string;
  url?: string;
  description: string;
  version: string;
  app_version: string;
  repository?: {name: string; url: string};
  isHubSearch?: boolean;
}
