import {useCallback, useMemo} from 'react';

import {Popconfirm} from 'antd';

import {DeleteOutlined, EditOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {DeletePreviewConfigurationTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {deletePreviewConfiguration, startPreview, stopPreview} from '@redux/thunks/preview';

import {Colors} from '@shared/styles/colors';

type IProps = {
  id: string;
  isSelected: boolean;
};

const PreviewConfigurationQuickAction: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();
  const preview = useAppSelector(state => state.main.preview);
  const previewConfiguration = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap?.[id]);
  const helmChart = useAppSelector(state =>
    previewConfiguration
      ? Object.values(state.main.helmChartMap).find(h => h.filePath === previewConfiguration.helmChartFilePath)
      : undefined
  );

  const isCurrentPreviewing = useMemo(
    () =>
      !previewConfiguration || !preview
        ? false
        : preview?.type === 'helm-config' && preview.configId === previewConfiguration.id,
    [preview, previewConfiguration]
  );

  const onClickDelete = useCallback(() => {
    if (!previewConfiguration) {
      return;
    }

    dispatch(deletePreviewConfiguration(previewConfiguration.id));
  }, [previewConfiguration, dispatch]);

  const onClickEdit = useCallback(() => {
    if (!previewConfiguration || !helmChart) {
      return;
    }

    dispatch(
      openPreviewConfigurationEditor({helmChartId: helmChart.id, previewConfigurationId: previewConfiguration.id})
    );
  }, [previewConfiguration, helmChart, dispatch]);

  const onClickRun = useCallback(() => {
    if (!previewConfiguration) {
      return;
    }

    dispatch(startPreview({type: 'helm-config', configId: previewConfiguration.id}));
  }, [dispatch, previewConfiguration]);

  const onClickExit = useCallback(() => {
    dispatch(stopPreview());
  }, [dispatch]);

  if (!previewConfiguration || !helmChart) {
    return null;
  }

  return (
    <>
      <Button
        isItemSelected={isSelected}
        onClick={() => {
          if (isCurrentPreviewing) {
            onClickExit();
          } else {
            onClickRun();
          }
        }}
      >
        {isCurrentPreviewing ? 'Exit' : 'Dry-run'}
      </Button>

      <Button isItemSelected={isSelected} onClick={() => onClickEdit()}>
        <EditOutlined />
      </Button>

      <Popconfirm title={DeletePreviewConfigurationTooltip} onConfirm={() => onClickDelete()}>
        <Button isItemSelected={isSelected}>
          <DeleteOutlined />
        </Button>
      </Popconfirm>
    </>
  );
};

export default PreviewConfigurationQuickAction;

// Styled Components

const Button = styled.span<{isItemSelected: boolean}>`
  margin-right: 15px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  color: ${props => (props.isItemSelected ? Colors.blackPure : Colors.blue6)};
`;
