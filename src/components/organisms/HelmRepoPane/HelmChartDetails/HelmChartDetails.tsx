import {Dispatch, useMemo} from 'react';

import {Tab} from 'rc-tabs/lib/interface';

import HelmInfo from './HelmChartTabs/HelmInfo';
import HelmTemplate from './HelmChartTabs/HelmTemplate';
import HelmValues from './HelmChartTabs/HelmValues';
import HelmReadme from './HelmChartTabs/HemlReadme';

import * as S from './styled';

const createTabItems = (chartName: string): Tab[] => [
  {
    key: 'info',
    label: 'Info',
    children: <HelmInfo chartName={chartName} />,
  },
  {
    key: 'templates',
    label: 'Templates',
    children: <HelmTemplate chartName={chartName} />,
  },
  {
    key: 'defaultValues',
    label: 'Default Values',
    children: <HelmValues chartName={chartName} />,
  },
  {
    key: 'changelog',
    label: 'Changelog',
    children: <HelmReadme chartName={chartName} />,
  },
];

interface IProps {
  chart: string;
  onDismissPane: Dispatch<null>;
}

const HelmChartDetails = ({chart, onDismissPane}: IProps) => {
  const chartName = chart.split('/')[1];

  const tabItems = useMemo(() => createTabItems(chart), [chart]);

  return (
    <S.Drawer
      placement="right"
      size="large"
      open={Boolean(chart)}
      getContainer={false}
      title={<S.Title>{chartName}</S.Title>}
      onClose={() => onDismissPane(null)}
    >
      <S.Tabs style={{height: '100%'}} items={tabItems} />
    </S.Drawer>
  );
};

export default HelmChartDetails;
