import {useCallback} from 'react';

import styled from 'styled-components';

import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';

import Colors from '@styles/Colors';

const StyledButton = styled.span<{isItemSelected: boolean}>`
  margin-right: 15px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => (props.isItemSelected ? Colors.blackPure : Colors.blue6)};
`;

const PreviewConfigurationQuickAction: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;
  const dispatch = useAppDispatch();

  const previewConfiguration = useAppSelector(
    state => state.config.projectConfig?.helm?.previewConfigurationMap?.[itemInstance.id]
  );

  const helmChart = useAppSelector(state =>
    previewConfiguration
      ? Object.values(state.main.helmChartMap).find(h => h.filePath === previewConfiguration.helmChartFilePath)
      : undefined
  );

  const onClickRun = useCallback(() => {
    if (!previewConfiguration) {
      return;
    }
    dispatch(runPreviewConfiguration(previewConfiguration));
  }, [dispatch, previewConfiguration]);

  const onClickEdit = useCallback(() => {
    if (!previewConfiguration || !helmChart) {
      return;
    }
    dispatch(
      openPreviewConfigurationEditor({helmChartId: helmChart.id, previewConfigurationId: previewConfiguration.id})
    );
  }, [previewConfiguration, helmChart, dispatch]);

  if (!previewConfiguration || !helmChart) {
    return null;
  }

  return (
    <>
      <StyledButton isItemSelected={itemInstance.isSelected} onClick={() => onClickRun()}>
        Run
      </StyledButton>
      <StyledButton isItemSelected={itemInstance.isSelected} onClick={() => onClickEdit()}>
        Edit
      </StyledButton>
    </>
  );
};

export default PreviewConfigurationQuickAction;
