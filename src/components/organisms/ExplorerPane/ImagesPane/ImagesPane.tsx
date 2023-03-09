import {memo} from 'react';
import {useMeasure} from 'react-use';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {SectionRenderer} from '@molecules';

import {SectionBlueprintList} from '@atoms';

import ImagesSectionBlueprint from '@src/navsections/ImagesSectionBlueprint';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';

const ImagesPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const imagesList = useAppSelector(state => state.main.imagesList);

  const [containerRef, {width: containerWidth}] = useMeasure<HTMLDivElement>();

  return (
    <AccordionPanel
      {...props}
      header={
        <AccordionTitleBarContainer ref={containerRef}>
          <TitleBar
            title="Images"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={size(imagesList)} isActive={Boolean(isActive)} />}
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <SectionBlueprintList id="images-section-container" $width={containerWidth + 15}>
        <SectionRenderer sectionId={ImagesSectionBlueprint.id} level={0} isLastSection={false} />
      </SectionBlueprintList>
    </AccordionPanel>
  );
};

export default memo(ImagesPane);
