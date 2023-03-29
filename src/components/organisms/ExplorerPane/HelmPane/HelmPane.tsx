import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import HelmList from './HelmList';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  return (
    <AccordionPanel
      {...props}
      disabled={isInClusterMode}
      header={
        <AccordionTitleBarContainer>
          <TitleBar
            title="Helm"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={size(helmChartMap)} isActive={Boolean(isActive)} />}
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <HelmList />
    </AccordionPanel>
  );
};

export default memo(HelmPane);
