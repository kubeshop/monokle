import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';
import {kustomizationResourcesSelectors} from '@redux/selectors';

import {SectionRenderer} from '@molecules';

import {SectionBlueprintList} from '@atoms';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';

const KustomizePane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey, width} = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const kustomizationsResources = useAppSelector(kustomizationResourcesSelectors);

  console.log(width);

  return (
    <AccordionPanel
      {...props}
      disabled={isInClusterMode}
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
      <SectionBlueprintList id="kustomize-sections-container" $width={width}>
        <SectionRenderer sectionId={KustomizationSectionBlueprint.id} level={0} isLastSection={false} />
        <SectionRenderer sectionId={KustomizePatchSectionBlueprint.id} level={0} isLastSection={false} />
      </SectionBlueprintList>
    </AccordionPanel>
  );
};

export default memo(KustomizePane);
