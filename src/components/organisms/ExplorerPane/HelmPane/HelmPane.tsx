import {memo} from 'react';
import {useMeasure} from 'react-use';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {SectionRenderer} from '@molecules';

import {SectionBlueprintList} from '@atoms';

import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <AccordionPanel
      {...props}
      disabled={isInClusterMode}
      header={
        <AccordionTitleBarContainer ref={containerRef}>
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
      <SectionBlueprintList id="helm-sections-container" $width={containerWidth + 15}>
        <SectionRenderer sectionId={RootHelmChartsSectionBlueprint.id} level={0} isLastSection={false} />
      </SectionBlueprintList>
    </AccordionPanel>
  );
};

export default memo(HelmPane);
