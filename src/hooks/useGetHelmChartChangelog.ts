import fetch from 'node-fetch';
import {useAsync} from 'react-use';

export const useGetHelmChartChangelog = (chartName: string) => {
  const state = useAsync(async () => {
    const [repoName, chart] = chartName.split('/') as [string, string];
    const result = await fetch(`https://artifacthub.io/api/v1/packages/helm/${repoName}/${chart}/changelog.md `);
    if (result.status !== 200) {
      throw new Error('Failed to fetch helm chart changelog');
    }
    return result.text();
  }, [chartName]);
  return state;
};
