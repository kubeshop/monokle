import {useEffect} from 'react';
import {useAsyncFn} from 'react-use';

import YAML from 'yaml';

import {helmChartInfoCommand} from '@utils/helm';

import {runCommandInMainThread} from '@shared/utils/commands';

export const useGetHelmChartInfo = (helmChartName: string) => {
  const [state, fetchChart] = useAsyncFn(async (): Promise<HelmChartInfo> => {
    const results = await runCommandInMainThread(helmChartInfoCommand({name: helmChartName}));

    if (results.stderr) {
      throw new Error('Failed to fetch helm chart info');
    }

    return YAML.parse(results.stdout || '');
  }, [helmChartName]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  return state;
};

interface HelmChartInfo {
  appVersion: string;
  apiVersion: string;
  home: string;
  icon: string;
  name: string;
  sources: string[];
  version: string;
  description: string;
  keywords: string[];
  maintainers: {name: string}[];
  annotations: {[key: string]: string};
  kubeVersion: string;
  changes: string[];
}
