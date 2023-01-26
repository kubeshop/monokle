import {useCallback, useMemo} from 'react';

import {Button, Dropdown, Tooltip} from 'antd';

import {LeftOutlined, RightOutlined} from '@ant-design/icons';

import {PANE_CONSTRAINT_VALUES, TOOLTIP_DELAY} from '@constants/constants';
import {
  EditPreviewConfigurationTooltip,
  RunPreviewConfigurationTooltip,
  SaveUnsavedResourceTooltip,
} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInClusterModeSelector, selectedHelmConfigSelector, selectedImageSelector} from '@redux/selectors';
import {startPreview} from '@redux/services/preview';

import {TitleBar} from '@monokle/components';
import {ResourceMeta, isTransientResource} from '@shared/models/k8sResource';
import {selectFromHistory} from '@shared/utils/selectionHistory';

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
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const imagesList = useAppSelector(state => state.main.imagesList);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const resourceMetaStorage = useAppSelector(state => state.main.resourceMetaStorage);
  const selectedHelmConfig = useAppSelector(selectedHelmConfigSelector);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);
  const selectedImage = useAppSelector(selectedImageSelector);

  const onClickEditPreviewConfiguration = useCallback(() => {
    if (!selectedHelmConfig) {
      return;
    }
    const chart = Object.values(helmChartMap).find(c => c.filePath === selectedHelmConfig.helmChartFilePath);
    if (!chart) {
      return;
    }
    dispatch(
      openPreviewConfigurationEditor({
        helmChartId: chart.id,
        previewConfigurationId: selectedHelmConfig.id,
      })
    );
  }, [dispatch, selectedHelmConfig, helmChartMap]);

  const onClickRunPreviewConfiguration = useCallback(() => {
    if (!selectedHelmConfig) {
      return;
    }

    startPreview({type: 'helm-config', configId: selectedHelmConfig.id}, dispatch);
  }, [dispatch, selectedHelmConfig]);

  const onClickLeftArrow = useCallback(() => {
    selectFromHistory(
      'left',
      selectionHistory.index,
      selectionHistory.current,
      resourceMetaStorage,
      fileMap,
      imagesList,
      dispatch
    );
  }, [dispatch, fileMap, imagesList, resourceMetaStorage, selectionHistory]);

  const onClickRightArrow = useCallback(() => {
    selectFromHistory(
      'right',
      selectionHistory.index,
      selectionHistory.current,
      resourceMetaStorage,
      fileMap,
      imagesList,
      dispatch
    );
  }, [dispatch, fileMap, imagesList, resourceMetaStorage, selectionHistory]);

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

  const isSelectedResourceUnsaved = useMemo(() => {
    if (!selectedResourceMeta) {
      return false;
    }
    return isTransientResource(selectedResourceMeta);
  }, [selectedResourceMeta]);

  const onSaveHandler = () => {
    if (selectedResourceMeta) {
      dispatch(openSaveResourcesToFileFolderModal([selectedResourceMeta]));
    }
  };

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
      <TitleBar
        title="Helm Command"
        actions={
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={RunPreviewConfigurationTooltip} placement="bottomLeft">
              <Button type="primary" size="small" ghost onClick={onClickRunPreviewConfiguration}>
                Preview
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
    );
  }

  if (selectedImage) {
    return (
      <TitleBar
        title="Image Info"
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
    );
  }

  return (
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

          {isSelectedResourceUnsaved && (
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SaveUnsavedResourceTooltip}>
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
                              <Scale isDropdownActive />
                              <Restart isDropdownActive />
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
  );
};

export default ActionsPaneHeader;
