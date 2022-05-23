import {useCallback, useMemo} from 'react';

import {Button, Tooltip} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {HELM_CHART_ENTRY_FILE, TOOLTIP_DELAY} from '@constants/constants';
import {
  ApplyFileTooltip,
  ApplyTooltip,
  DiffTooltip,
  EditPreviewConfigurationTooltip,
  InstallValuesFileTooltip,
  RunPreviewConfigurationTooltip,
  SaveUnsavedResourceTooltip,
} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal} from '@redux/reducers/ui';
import {knownResourceKindsSelector} from '@redux/selectors';
import {isHelmTemplateFile, isHelmValuesFile} from '@redux/services/helm';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {startPreview} from '@redux/services/preview';
import {isUnsavedResource} from '@redux/services/resource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';

import {TitleBar} from '@molecules';

import {Icon} from '@atoms';

import * as S from './ActionsPaneHeader.styled';

interface IProps {
  selectedResource: K8sResource | undefined;
  applySelection: () => void;
  diffSelectedResource: () => void;
}

const ActionsPaneHeader: React.FC<IProps> = props => {
  const {selectedResource, applySelection, diffSelectedResource} = props;

  const dispatch = useAppDispatch();
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const imagesList = useAppSelector(state => state.main.imagesList);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);
  const selectedPreviewConfiguration = useAppSelector(state => {
    if (!selectedPreviewConfigurationId) {
      return undefined;
    }
    return state.config.projectConfig?.helm?.previewConfigurationMap?.[selectedPreviewConfigurationId];
  });
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
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

  const deployTooltip = useMemo(() => {
    return selectedPath ? (isHelmValuesFile(selectedPath) ? InstallValuesFileTooltip : ApplyFileTooltip) : ApplyTooltip;
  }, [selectedPath]);

  const isDeployButtonDisabled = useMemo(() => {
    return (
      (!selectedResourceId && !selectedPath) ||
      (selectedPath && selectedPath.endsWith(HELM_CHART_ENTRY_FILE)) ||
      (selectedPath && isHelmTemplateFile(selectedPath)) ||
      (selectedResource &&
        !isKustomizationResource(selectedResource) &&
        (isKustomizationPatch(selectedResource) || !knownResourceKinds.includes(selectedResource.kind)))
    );
  }, [selectedResource, knownResourceKinds, selectedResourceId, selectedPath]);

  const isDiffButtonDisabled = useMemo(() => {
    if (!selectedResource) {
      return true;
    }
    if (isKustomizationPatch(selectedResource) || isKustomizationResource(selectedResource)) {
      return true;
    }
    if (!knownResourceKinds.includes(selectedResource.kind)) {
      return true;
    }
    return false;
  }, [selectedResource, knownResourceKinds]);

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

  if (selectedPreviewConfigurationId) {
    return (
      <TitleBar title="Helm Command">
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={RunPreviewConfigurationTooltip} placement="bottomLeft">
          <Button type="primary" size="small" ghost onClick={onClickRunPreviewConfiguration}>
            Preview
          </Button>
        </Tooltip>
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={EditPreviewConfigurationTooltip} placement="bottomLeft">
          <S.DiffButton size="small" type="primary" ghost onClick={onClickEditPreviewConfiguration}>
            Edit
          </S.DiffButton>
        </Tooltip>
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
          icon={<ArrowLeftOutlined />}
        />

        <S.RightArrowButton
          onClick={onClickRightArrow}
          disabled={!isRightArrowEnabled}
          type="link"
          size="small"
          icon={<ArrowRightOutlined />}
        />

        {isSelectedResourceUnsaved && (
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SaveUnsavedResourceTooltip}>
            <S.SaveButton id="save-button" type="primary" size="small" onClick={onSaveHandler}>
              Save
            </S.SaveButton>
          </Tooltip>
        )}

        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={deployTooltip} placement="bottomLeft">
          <Button
            loading={Boolean(applyingResource)}
            type="primary"
            size="small"
            ghost
            onClick={applySelection}
            disabled={isDeployButtonDisabled}
            icon={<Icon name="kubernetes" />}
          >
            {selectedPath && isHelmValuesFile(selectedPath) ? 'Install' : 'Deploy'}
          </Button>
        </Tooltip>

        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DiffTooltip} placement="bottomLeft">
          <S.DiffButton
            size="small"
            type="primary"
            ghost
            onClick={diffSelectedResource}
            disabled={isDiffButtonDisabled}
          >
            Diff
          </S.DiffButton>
        </Tooltip>
      </>
    </TitleBar>
  );
};

export default ActionsPaneHeader;
