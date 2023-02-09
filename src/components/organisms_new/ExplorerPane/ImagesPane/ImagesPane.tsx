import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';

import {useAppSelector} from '@redux/hooks';

import {SectionRenderer} from '@molecules';

import ImagesSectionBlueprint from '@src/navsections/ImagesSectionBlueprint';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import * as S from './ImagesPane.styled';

const ImagesPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const imagesList = useAppSelector(state => state.main.imagesList);

  return (
    <AccordionPanel
      {...props}
      header={
        <AccordionTitleBarContainer>
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
      <S.List id="images-section-container">
        <SectionRenderer sectionId={ImagesSectionBlueprint.id} level={0} isLastSection={false} />
      </S.List>
    </AccordionPanel>
  );
};

export default memo(ImagesPane);
