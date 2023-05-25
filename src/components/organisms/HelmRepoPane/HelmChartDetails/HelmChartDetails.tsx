import {Dispatch, useMemo, useRef} from 'react';

import {CloseOutlined} from '@ant-design/icons';

import {Tab} from 'rc-tabs/lib/interface';

import {useOnClickOutside} from '@hooks/useOnClickOutside';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const chartName = chart.split('/')[1];

  const tabItems = useMemo(() => createTabItems(chart), [chart]);
  useOnClickOutside(containerRef, () => onDismissPane(null));

  return (
    <S.Container ref={containerRef}>
      <S.Content>
        <S.Header>
          <S.Title>{chartName}</S.Title>
          <S.CloseButton onClick={() => onDismissPane(null)}>
            <CloseOutlined />
          </S.CloseButton>
        </S.Header>
        <S.Tabs style={{height: '100%'}} items={tabItems} />
      </S.Content>
    </S.Container>
  );
};

export default HelmChartDetails;
