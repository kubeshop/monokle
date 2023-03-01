import {memo} from 'react';
import {useMeasure} from 'react-use';

import {Button, CollapsePanelProps} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateHelmChartAndKustomizationModal} from '@redux/reducers/ui';
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
  const {isActive, panelKey} = props;

  const dispatch = useAppDispatch();
  const kustomizationsResources = useAppSelector(kustomizationResourcesSelectors);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <AccordionPanel
      {...props}
      header={
        <AccordionTitleBarContainer ref={containerRef}>
          <TitleBar
            title="Kustomize"
            expandable
            isOpen={Boolean(isActive)}
            actions={
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <TitleBarCount count={kustomizationsResources.length} isActive={Boolean(isActive)} />
                {isActive && (
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      dispatch(openCreateHelmChartAndKustomizationModal('kustomization'));
                    }}
                    size="small"
                    type="text"
                    icon={<PlusOutlined />}
                  />
                )}
              </div>
            }
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <SectionBlueprintList id="kustomize-sections-container" $width={containerWidth + 15}>
        <SectionRenderer sectionId={KustomizationSectionBlueprint.id} level={0} isLastSection={false} />
        <SectionRenderer sectionId={KustomizePatchSectionBlueprint.id} level={0} isLastSection={false} />
      </SectionBlueprintList>
    </AccordionPanel>
  );
};

export default memo(KustomizePane);
