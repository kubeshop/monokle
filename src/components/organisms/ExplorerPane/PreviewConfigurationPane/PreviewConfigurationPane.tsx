import {memo, useMemo} from 'react';

import {CollapsePanelProps} from 'antd';

import {isEmpty, size} from 'lodash';
import styled from 'styled-components';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppSelector} from '@redux/hooks';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {isDefined} from '@shared/utils/filter';

import AccordionPanel from '../AccordionPanel';
import {AccordionTitleBarContainer} from '../AccordionPanel/AccordionTitleBarContainer';
import PreviewConfigurationAdd from './PreviewConfigurationAdd';
import PreviewConfigurationList from './PreviewConfigurationList';

const PreviewConfigurationPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);

  const count = useMemo(
    () =>
      isDefined(previewConfigurationMap)
        ? size(
            Object.values(previewConfigurationMap).filter(
              previewConfiguration => isDefined(previewConfiguration) && !isEmpty(previewConfiguration)
            )
          )
        : 0,
    [previewConfigurationMap]
  );

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      header={
        <AccordionTitleBarContainer>
          <TitleBar
            title="Helm Preview Configurations"
            expandable
            isOpen={Boolean(isActive)}
            actions={<TitleBarCount count={count} isActive={Boolean(isActive)} />}
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
