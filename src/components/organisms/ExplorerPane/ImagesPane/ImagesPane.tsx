import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {Colors} from '@shared/styles/colors';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import ImageFilteredTag from './ImageFilteredTag';
import ImageSearch from './ImageSearch';
import ImagesList from './ImagesList';

const ImagesPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const imageMap = useAppSelector(state => state.main.imageMap);

  return (
    <AccordionPanel
      {...props}
      header={
        <AccordionTitleBarContainer>
          <TitleBar
            title="Images"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={size(imageMap)} isActive={Boolean(isActive)} />}
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <ImageTopContainer>
        <ImageFilteredTag />
        <ImageSearch />
      </ImageTopContainer>

      <ImagesList />
    </AccordionPanel>
  );
};

export default memo(ImagesPane);

// Styled Components

const ImageTopContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 16px 14px 16px 16px;
  font-size: 12px;
  color: ${Colors.grey9};
`;
