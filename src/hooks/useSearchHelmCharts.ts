import {useMemo} from 'react';
import {useAsync} from 'react-use';

import {searchHelmHubCommand, searchHelmRepoCommand} from '@utils/helm';

import {ChartInfo} from '@shared/models/ui';
import {runCommandInMainThread} from '@shared/utils/commands';

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
    const data = JSON.parse(result.stdout || '[]') as ChartInfo[];
    return data.filter(f => f.name.includes(helmRepoSearch));
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

  const result = useMemo(() => [...repoResult, ...hubResult].sort(sortChartsByName), [repoResult, hubResult]);

  return {result, error, loading};
};

const extractChartName = (item: ChartInfo) => {
  const urlPath = item?.url?.split('/') || ['', ''];
  return `${urlPath[urlPath.length - 2]}/${urlPath[urlPath.length - 1]}`;
};

export const sortChartsByName = (a: ChartInfo, b: ChartInfo) => {
  const [chartRepoA, chartNameA] = a.name.split('/');
  const [chartRepoB, chartNameB] = b.name.split('/');
  if (chartNameA.localeCompare(chartNameB) !== 0) {
    return chartNameA.localeCompare(chartNameB);
  }
  return chartRepoA.localeCompare(chartRepoB);
};
