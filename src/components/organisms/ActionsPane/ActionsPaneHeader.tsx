import {useCallback, useMemo} from 'react';

import {Button, Dropdown, Modal, Tooltip} from 'antd';

import {LeftOutlined, RightOutlined} from '@ant-design/icons';

import {PANE_CONSTRAINT_VALUES, TOOLTIP_DELAY} from '@constants/constants';
import {
  EditPreviewConfigurationTooltip,
  InstallPreviewConfigurationTooltip,
  RunPreviewConfigurationTooltip,
  SaveTransientResourceTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {selectedHelmConfigSelector, selectedImageSelector} from '@redux/selectors';
import {startPreview} from '@redux/thunks/preview';
import {runPreviewConfiguration} from '@redux/thunks/runPreviewConfiguration';
import {selectFromHistory} from '@redux/thunks/selectFromHistory';

import {TitleBarWrapper} from '@components/atoms';

import {useRefSelector} from '@utils/hooks';

import {TitleBar} from '@monokle/components';
import {ResourceMeta} from '@shared/models/k8sResource';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import * as S from './ActionsPaneHeader.styled';
import Diff from './Diff/Diff';
import InstallDeploy from './InstallDeploy/InstallDeploy';
import Restart from './Restart/Restart';
import Scale from './Scale/Scale';

interface IProps {
  selectedResourceMeta: ResourceMeta | undefined;
  applySelection: () => void;
  actionsPaneWidth: number;
}

const ActionsPaneHeader: React.FC<IProps> = props => {
  const {selectedResourceMeta, applySelection, actionsPaneWidth} = props;
  const dispatch = useAppDispatch();
  const helmChartMapRef = useRefSelector(state => state.main.helmChartMap);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);

  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const selectedHelmConfig = useAppSelector(selectedHelmConfigSelector);
  const selectedImage = useAppSelector(selectedImageSelector);

  const onClickEditPreviewConfiguration = useCallback(() => {
    if (!selectedHelmConfig) {
      return;
    }
    const chart = Object.values(helmChartMapRef.current).find(c => c.filePath === selectedHelmConfig.helmChartFilePath);
    if (!chart) {
      return;
    }
    dispatch(
      openPreviewConfigurationEditor({
        helmChartId: chart.id,
        previewConfigurationId: selectedHelmConfig.id,
      })
    );
  }, [dispatch, selectedHelmConfig, helmChartMapRef]);

  const onClickRunPreviewConfiguration = useCallback(() => {
    if (!selectedHelmConfig) {
      return;
    }

    dispatch(startPreview({type: 'helm-config', configId: selectedHelmConfig.id}));
  }, [dispatch, selectedHelmConfig]);

  const onClickInstallPreviewConfiguration = useCallback(() => {
    Modal.confirm({
      title: 'Install Helm Chart',
      content: `Are you sure you want to install the **${selectedHelmConfig?.name}** configuration to the cluster?`,
      onOk: () => {
        if (!selectedHelmConfig) {
          return;
        }
        dispatch(runPreviewConfiguration({helmConfigId: selectedHelmConfig.id, performDeploy: true}));
      },
    });
  }, [dispatch, selectedHelmConfig]);

  const onClickLeftArrow = useCallback(() => {
    dispatch(selectFromHistory('left'));
  }, [dispatch]);

  const onClickRightArrow = useCallback(() => {
    dispatch(selectFromHistory('right'));
  }, [dispatch]);

  const isLeftArrowEnabled = useMemo(
    () =>
      selectionHistory.current.length > 1 &&
      (selectionHistory.index === undefined || (selectionHistory.index && selectionHistory.index > 0)),
    [selectionHistory]
  );

  const isRightArrowEnabled = useMemo(
    () =>
      selectionHistory.current.length > 1 &&
      selectionHistory.index !== undefined &&
      selectionHistory.index < selectionHistory.current.length - 1,
    [selectionHistory]
  );

  const isSelectedResourceTransient = useMemo(() => {
    if (!selectedResourceMeta) {
      return false;
    }
    return selectedResourceMeta.storage === 'transient';
  }, [selectedResourceMeta]);

  const onSaveHandler = useCallback(() => {
    if (selectedResourceMeta) {
      dispatch(openSaveResourcesToFileFolderModal([selectedResourceMeta]));
    }
  }, [dispatch, selectedResourceMeta]);

  const showActionsDropdown = useMemo(
    () =>
      !(
        actionsPaneWidth <
        PANE_CONSTRAINT_VALUES.minEditPane - (isInClusterMode && selectedResourceMeta?.kind === 'Deployment' ? 0 : 105)
      ),
    [actionsPaneWidth, isInClusterMode, selectedResourceMeta?.kind]
  );

  if (selectedHelmConfig) {
    return (
      <TitleBarWrapper>
        <TitleBar
          title="Helm Command"
          type="secondary"
          actions={
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <Tooltip
                mouseEnterDelay={TOOLTIP_DELAY}
                title={InstallPreviewConfigurationTooltip}
                placement="bottomLeft"
              >
                <Button type="primary" size="small" ghost onClick={onClickInstallPreviewConfiguration}>
                  Install
                </Button>
              </Tooltip>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={RunPreviewConfigurationTooltip} placement="bottomLeft">
                <Button type="primary" size="small" ghost onClick={onClickRunPreviewConfiguration}>
                  Dry-run
                </Button>
              </Tooltip>
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={EditPreviewConfigurationTooltip} placement="bottomLeft">
                <Button size="small" type="primary" ghost onClick={onClickEditPreviewConfiguration}>
                  Edit
                </Button>
              </Tooltip>
            </div>
          }
        />
      </TitleBarWrapper>
    );
  }

  if (selectedImage) {
    return (
      <TitleBarWrapper>
        <TitleBar
          title="Image Info"
          type="secondary"
          actions={
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <S.LeftArrowButton
                onClick={onClickLeftArrow}
                disabled={!isLeftArrowEnabled}
                type="link"
                size="small"
                icon={<LeftOutlined />}
              />

              <S.RightArrowButton
                onClick={onClickRightArrow}
                disabled={!isRightArrowEnabled}
                type="link"
                size="small"
                icon={<RightOutlined />}
              />
            </div>
          }
        />
      </TitleBarWrapper>
    );
  }

  return (
    <TitleBarWrapper $editor>
      <TitleBar
        type="secondary"
        title="Editor"
        actions={
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <S.LeftArrowButton
              onClick={onClickLeftArrow}
              disabled={!isLeftArrowEnabled}
              type="link"
              size="small"
              icon={<LeftOutlined />}
            />

            <S.RightArrowButton
              onClick={onClickRightArrow}
              disabled={!isRightArrowEnabled}
              type="link"
              size="small"
              icon={<RightOutlined />}
            />

            {isSelectedResourceTransient && (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SaveTransientResourceTooltip}>
                <S.SaveButton id="save-button" type="primary" size="small" onClick={onSaveHandler}>
                  Save
                </S.SaveButton>
              </Tooltip>
            )}

            <S.ButtonContainer>
              {showActionsDropdown ? (
                <>
                  {isInClusterMode && selectedResourceMeta?.kind === 'Deployment' && (
                    <>
                      <Scale />
                      <Restart />
                    </>
                  )}
                  <InstallDeploy applySelection={applySelection} />
                  <Diff />
                </>
              ) : (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'actions',
                        label: (
                          <S.DropdownActionContainer>
                            {isInClusterMode && selectedResourceMeta?.kind === 'Deployment' && (
                              <>
                                <Scale />
                                <Restart />
                              </>
                            )}
                            <InstallDeploy applySelection={applySelection} />
                            <Diff />
                          </S.DropdownActionContainer>
                        ),
                      },
                    ],
                  }}
                  placement="bottomLeft"
                  overlayClassName="dropdown-custom-styling"
                >
                  <S.EllipsisOutlined />
                </Dropdown>
              )}
            </S.ButtonContainer>
          </div>
        }
      />
    </TitleBarWrapper>
  );
};

export default ActionsPaneHeader;
