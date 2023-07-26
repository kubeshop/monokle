import {memo, useMemo} from 'react';

import {CollapsePanelProps} from 'antd';

import {isEmpty, size} from 'lodash';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';

import {AccordionPanel} from '@components/atoms';

import {TitleBar, TitleBarCount} from '@monokle/components';
import {InjectedPanelProps} from '@shared/models/explorer';
import {isDefined} from '@shared/utils/filter';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import PreviewConfigurationAdd from './PreviewConfigurationAdd';
import PreviewConfigurationList from './PreviewConfigurationList';

const PreviewConfigurationPane: React.FC<InjectedPanelProps> = props => {
  const {isActive, panelKey} = props;

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const previewConfigurationMap = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap);

  const count = useMemo(
    () =>
      isDefined(previewConfigurationMap)
        ? size(
            Object.values(previewConfigurationMap).filter(
              previewConfiguration =>
                isDefined(previewConfiguration) &&
                !isEmpty(previewConfiguration) &&
                fileMap[previewConfiguration.helmChartFilePath]
            )
          )
        : 0,
    [fileMap, previewConfigurationMap]
  );

  return (
    <AccordionPanel
      {...props}
      collapsible={isInClusterMode ? 'disabled' : undefined}
      header={
        <TitleBar
          title="Helm Dry-run Configurations"
          expandable
          isOpen={Boolean(isActive)}
          actions={<TitleBarCount count={count} isActive={Boolean(isActive)} />}
        />
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
  /* padding: 4px 14px 16px 16px; */
  margin-top: -6px;
  padding-left: 20px;
  padding-bottom: 12px;
`;
