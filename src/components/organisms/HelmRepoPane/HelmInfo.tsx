import ReactMarkdown from 'react-markdown';
import {useAsync} from 'react-use';

import {Button, Skeleton} from 'antd';

import {helmChartInfoCommand, runCommandInMainThread} from '@shared/utils/commands';

interface IProps {
  chartName: string;
}

const HelmInfo = ({chartName}: IProps) => {
  const {value, loading} = useAsync(async () => {
    const result = await runCommandInMainThread(helmChartInfoCommand({name: chartName}));
    return result.stdout;
  }, [chartName]);
  return loading ? (
    <Skeleton loading={loading} />
  ) : (
    <div>
      <ReactMarkdown>{value || ''}</ReactMarkdown>
      <Button type="primary">Pull helm chart</Button>
    </div>
  );
};

export default HelmInfo;
