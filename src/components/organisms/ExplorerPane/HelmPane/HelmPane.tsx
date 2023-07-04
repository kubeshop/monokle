import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {helmChartsCountSelector} from '@redux/selectors';

import {AccordionPanel} from '@components/atoms';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import HelmList from './HelmList';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const helmChartsCount = useAppSelector(helmChartsCountSelector);

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      header={
        <TitleBar
          title="Helm Charts"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={helmChartsCount} isActive={Boolean(isActive)} />}
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
