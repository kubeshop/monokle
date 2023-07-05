import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {kustomizationResourcesSelectors} from '@redux/selectors';

import {AccordionPanel} from '@components/atoms';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {isInClusterModeSelector} from '@shared/utils/selectors';

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
        <TitleBar
          title="Kustomize"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={kustomizationsResources.length} isActive={Boolean(isActive)} />}
        />
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <KustomizeList />
    </AccordionPanel>
  );
};

export default memo(KustomizePane);
