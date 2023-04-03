import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {kustomizationResourcesSelectors} from '@redux/selectors';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import KustomizeList from './KustomizeList';

const KustomizePane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const kustomizationsResources = useAppSelector(kustomizationResourcesSelectors);

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      header={
        <AccordionTitleBarContainer>
          <TitleBar
            title="Kustomize"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={kustomizationsResources.length} isActive={Boolean(isActive)} />}
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <KustomizeList />
    </AccordionPanel>
  );
};

export default memo(KustomizePane);
