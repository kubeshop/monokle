import path from 'path';

import {HelmChart} from '@models/helm';

export function buildHelmCommand(
  helmChart: HelmChart,
  valuesFilePaths: string[],
  command: 'template' | 'install',
  options: Record<string, string | null>,
  rootFolderPath: string,
  clusterContext?: string
): string[] {
  const chartFolderPath = path.join(rootFolderPath, path.dirname(helmChart.filePath));

  const args = [
    'helm',
    command,
    ...valuesFilePaths.map(filePath => ['-f', `"${path.join(rootFolderPath, filePath)}"`]).flat(),
    helmChart.name,
    `"${chartFolderPath}"`,
    ...Object.entries(options)
      .map(([key, value]) => (!value ? [key] : [key, `"${value}"`]))
      .flat(),
  ];

  if (command === 'install') {
    if (clusterContext) {
      args.splice(1, 0, ...['--kube-context', clusterContext]);
    }
    args.push('--dry-run');
  }

  return args;
}
