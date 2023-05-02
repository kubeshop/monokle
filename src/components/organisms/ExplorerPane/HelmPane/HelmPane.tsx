import {memo, useMemo} from 'react';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import AccordionPanel from '../AccordionPanel';
import HelmList from './HelmList';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const count = useMemo(
    () => size(Object.values(helmChartMap).filter(chart => !chart.name.includes('Unnamed Chart:'))),
    [helmChartMap]
  );

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      header={
        <TitleBar
          title="Helm Charts"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={count} isActive={Boolean(isActive)} />}
        />
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <HelmList />
    </AccordionPanel>
  );
};

export default memo(HelmPane);
