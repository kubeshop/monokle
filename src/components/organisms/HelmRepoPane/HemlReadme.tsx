import ReactMarkdown from 'react-markdown';
import {useAsync} from 'react-use';

import {Skeleton} from 'antd';

import {helmChartReadmeCommand, runCommandInMainThread} from '@shared/utils/commands';

interface IProps {
  chartName: string;
}

const HelmReadme = ({chartName}: IProps) => {
  const {value = '', loading} = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartReadmeCommand({name: chartName}));
    return result.stdout;
  }, [chartName]);

  return loading ? <Skeleton active={loading} /> : <ReactMarkdown>{value}</ReactMarkdown>;
};

export default HelmReadme;
