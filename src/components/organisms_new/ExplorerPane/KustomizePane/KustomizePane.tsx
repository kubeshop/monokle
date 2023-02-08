import {CollapsePanelProps} from 'antd';

import {useAppSelector} from '@redux/hooks';
import {kustomizationResourcesSelectors} from '@redux/selectors';

import {SectionRenderer} from '@molecules';

import KustomizationSectionBlueprint from '@src/navsections/KustomizationSectionBlueprint';
import KustomizePatchSectionBlueprint from '@src/navsections/KustomizePatchSectionBlueprint';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import * as S from './KustomizePane.styled';

const KustomizePane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const kustomizationsResources = useAppSelector(kustomizationResourcesSelectors);

  return (
    <AccordionPanel
      {...props}
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
      <S.List id="kustomize-sections-container">
        <SectionRenderer sectionBlueprint={KustomizationSectionBlueprint} level={0} isLastSection={false} />
        <SectionRenderer sectionBlueprint={KustomizePatchSectionBlueprint} level={0} isLastSection={false} />
      </S.List>
    </AccordionPanel>
  );
};

export default KustomizePane;
