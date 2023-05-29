import {useAsync} from 'react-use';

import {helmChartReadmeCommand, runCommandInMainThread} from '@shared/utils/commands';

export const useGetHelmChartChangelog = (chartName: string) => {
  const state = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartReadmeCommand({name: chartName}));
    return result.stdout || 'No changelog';
  }, [chartName]);
  return state;
};
