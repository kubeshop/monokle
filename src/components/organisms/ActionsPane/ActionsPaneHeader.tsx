import {useCallback, useMemo} from 'react';

import {Button, Dropdown, Tooltip} from 'antd';

import {LeftOutlined, RightOutlined} from '@ant-design/icons';

import {PANE_CONSTRAINT_VALUES, TOOLTIP_DELAY} from '@constants/constants';
import {
  EditPreviewConfigurationTooltip,
  RunPreviewConfigurationTooltip,
  SaveUnsavedResourceTooltip,
} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';
import {startPreview} from '@redux/services/preview';
import {isUnsavedResource} from '@redux/services/resource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';

import {TitleBar} from '@atoms';

import * as S from './ActionsPaneHeader.styled';
import Diff from './Diff/Diff';
import InstallDeploy from './InstallDeploy/InstallDeploy';
import Restart from './Restart/Restart';
import Scale from './Scale/Scale';

interface IProps {
  selectedResource: K8sResource | undefined;
  applySelection: () => void;
  actionsPaneWidth: number;
}

const ActionsPaneHeader: React.FC<IProps> = props => {
  const {selectedResource, applySelection, actionsPaneWidth} = props;

  const dispatch = useAppDispatch();
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const imagesList = useAppSelector(state => state.main.imagesList);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedImage = useAppSelector(state => state.main.selectedImage);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);
  const selectedPreviewConfiguration = useAppSelector(state => {
    if (!selectedPreviewConfigurationId) {
      return undefined;
    }
    return state.config.projectConfig?.helm?.previewConfigurationMap?.[selectedPreviewConfigurationId];
  });

  const selectionHistory = useAppSelector(state => state.main.selectionHistory);

  const onClickEditPreviewConfiguration = useCallback(() => {
    if (!selectedPreviewConfiguration) {
      return;
    }
    const chart = Object.values(helmChartMap).find(c => c.filePath === selectedPreviewConfiguration.helmChartFilePath);
    if (!chart) {
      return;
    }
    dispatch(
      openPreviewConfigurationEditor({
        helmChartId: chart.id,
        previewConfigurationId: selectedPreviewConfiguration.id,
      })
    );
  }, [dispatch, selectedPreviewConfiguration, helmChartMap]);

  const onClickRunPreviewConfiguration = useCallback(() => {
    if (!selectedPreviewConfiguration) {
      return;
    }

    startPreview(selectedPreviewConfiguration.id, 'helm-preview-config', dispatch);
  }, [dispatch, selectedPreviewConfiguration]);

  const onClickLeftArrow = useCallback(() => {
    selectFromHistory(
      'left',
      currentSelectionHistoryIndex,
      selectionHistory,
      resourceMap,
      fileMap,
      imagesList,
      dispatch
    );
  }, [currentSelectionHistoryIndex, dispatch, fileMap, imagesList, resourceMap, selectionHistory]);

  const onClickRightArrow = useCallback(() => {
    selectFromHistory(
      'right',
      currentSelectionHistoryIndex,
      selectionHistory,
      resourceMap,
      fileMap,
      imagesList,
      dispatch
    );
  }, [currentSelectionHistoryIndex, dispatch, fileMap, imagesList, resourceMap, selectionHistory]);

  const isLeftArrowEnabled = useMemo(
    () =>
      selectionHistory.length > 1 &&
      (currentSelectionHistoryIndex === undefined ||
        (currentSelectionHistoryIndex && currentSelectionHistoryIndex > 0)),
    [currentSelectionHistoryIndex, selectionHistory.length]
  );

  const isRightArrowEnabled = useMemo(
    () =>
      selectionHistory.length > 1 &&
      currentSelectionHistoryIndex !== undefined &&
      currentSelectionHistoryIndex < selectionHistory.length - 1,
    [currentSelectionHistoryIndex, selectionHistory.length]
  );

  const isSelectedResourceUnsaved = useMemo(() => {
    if (!selectedResource) {
      return false;
    }
    return isUnsavedResource(selectedResource);
  }, [selectedResource]);

  const onSaveHandler = () => {
    if (selectedResource) {
      dispatch(openSaveResourcesToFileFolderModal([selectedResource.id]));
    }
  };

  const showActionsDropdown = useMemo(
    () =>
      !(
        actionsPaneWidth <
        PANE_CONSTRAINT_VALUES.minEditPane - (isInClusterMode && selectedResource?.kind === 'Deployment' ? 0 : 105)
      ),
    [actionsPaneWidth, isInClusterMode, selectedResource?.kind]
  );

  if (selectedPreviewConfigurationId) {
    return (
      <TitleBar title="Helm Command">
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
      </TitleBar>
    );
  }

  if (selectedImage) {
    return (
      <TitleBar title="Image Info">
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
      </TitleBar>
    );
  }

  return (
    <TitleBar title="Editor">
      <>
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
              <Diff />
              {isInClusterMode && selectedResource?.kind === 'Deployment' && (
                <>
                  <Scale />
                  <Restart />
                </>
              )}
              <InstallDeploy applySelection={applySelection} />
            </>
          ) : (
            <Dropdown
              overlay={
                <S.DropdownActionContainer>
                  <Diff isDropdownActive />
                  {isInClusterMode && selectedResource?.kind === 'Deployment' && (
                    <>
                      <Scale isDropdownActive />
                      <Restart isDropdownActive />
                    </>
                  )}
                  <InstallDeploy applySelection={applySelection} isDropdownActive />
                </S.DropdownActionContainer>
              }
              placement="bottomLeft"
            >
              <S.EllipsisOutlined />
            </Dropdown>
          )}
        </S.ButtonContainer>
      </>
    </TitleBar>
  );
};

export default ActionsPaneHeader;
