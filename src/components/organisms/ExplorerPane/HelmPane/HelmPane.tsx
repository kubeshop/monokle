import {memo} from 'react';
import {useMeasure} from 'react-use';

import {Button, CollapsePanelProps} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import {size} from 'lodash';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openCreateHelmChartAndKustomizationModal} from '@redux/reducers/ui';

import {SectionRenderer} from '@molecules';

import {SectionBlueprintList} from '@atoms';

import RootHelmChartsSectionBlueprint from '@src/navsections/HelmChartSectionBlueprint';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';

const HelmPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const dispatch = useAppDispatch();
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <AccordionPanel
      {...props}
      header={
        <AccordionTitleBarContainer ref={containerRef}>
          <TitleBar
            title="Helm"
            expandable
            isOpen={Boolean(isActive)}
            actions={
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <TitleBarCount count={size(helmChartMap)} isActive={Boolean(isActive)} />
                {isActive && (
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      dispatch(openCreateHelmChartAndKustomizationModal('helm'));
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
      <SectionBlueprintList id="helm-sections-container" $width={containerWidth + 15}>
        <SectionRenderer sectionId={RootHelmChartsSectionBlueprint.id} level={0} isLastSection={false} />
      </SectionBlueprintList>
    </AccordionPanel>
  );
};

export default memo(HelmPane);
