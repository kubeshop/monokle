import {memo} from 'react';

import {CollapsePanelProps} from 'antd';

import {size} from 'lodash';
import styled from 'styled-components';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import PreviewConfigurationAdd from './PreviewConfigurationAdd';
import PreviewConfigurationList from './PreviewConfigurationList';

const PreviewConfigurationPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);

  return (
    <AccordionPanel
      {...props}
      disabled={isInClusterMode}
      header={
        <AccordionTitleBarContainer>
          <TitleBar
            title="Preview Configurations"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={size(previewConfigurationMap)} isActive={Boolean(isActive)} />}
          />
        </AccordionTitleBarContainer>
      }
      showArrow={false}
      key={panelKey as CollapsePanelProps['key']}
    >
      <PreviewConfigurationTopContainer>
        <PreviewConfigurationAdd />
      </PreviewConfigurationTopContainer>

      <PreviewConfigurationList />
    </AccordionPanel>
  );
};

export default memo(PreviewConfigurationPane);

// Styled Components

const PreviewConfigurationTopContainer = styled.div`
  width: 100%;
  padding: 16px 14px 16px 16px;
`;
