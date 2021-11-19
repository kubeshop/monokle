import {Button, Col, Dropdown, Menu, Row, Tabs, Tooltip} from 'antd';
import React, {useCallback, useEffect, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setMonacoEditor} from '@redux/reducers/ui';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {applyHelmChartWithConfirm} from '@redux/services/applyHelmChartWithConfirm';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {isUnsavedResource} from '@redux/services/resource';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';

import {K8sResource} from '@models/k8sresource';

import FormEditor from '@molecules/FormEditor';
import Monaco from '@molecules/Monaco';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import TabHeader from '@atoms/TabHeader';

import FileExplorer from '@components/atoms/FileExplorer';
import Icon from '@components/atoms/Icon';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {ArrowLeftOutlined, ArrowRightOutlined, CodeOutlined, ContainerOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ApplyFileTooltip, ApplyTooltip, DiffTooltip, SaveUnsavedResourceTooltip} from '@constants/tooltips';

import {
  ActionsPaneContainer,
  DiffButton,
  RightButtons,
  SaveButton,
  StyledLeftArrowButton,
  StyledRightArrowButton,
  StyledSkeleton,
  StyledTabs,
  TitleBarContainer,
} from './ActionsPane.styled';

const {TabPane} = Tabs;

const ActionsPane = (props: {contentHeight: string}) => {
  const {contentHeight} = props;

  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfigContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const kustomizeCommand = useAppSelector(state => state.config.settings.kustomizeCommand);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);
  const previewType = useAppSelector(state => state.main.previewType);
  const monacoEditor = useAppSelector(state => state.ui.monacoEditor);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const [key, setKey] = useState('source');
  const dispatch = useAppDispatch();

  const onSelect = useCallback(
    (absolutePath: string) => {
      if (!selectedResourceId) {
        return;
      }
      dispatch(
        saveUnsavedResource({
          resourceId: selectedResourceId,
          absolutePath,
        })
      );
    },
    [selectedResourceId, dispatch]
  );

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({filePath}) => {
      if (!filePath) {
        return;
      }
      onSelect(filePath);
    },
    {
      acceptedFileExtensions: ['.yaml'],
    }
  );

  const {openFileExplorer: openDirectoryExplorer, fileExplorerProps: directoryExplorerProps} = useFileExplorer(
    ({folderPath}) => {
      if (!folderPath) {
        return;
      }
      onSelect(folderPath);
    },
    {
      isDirectoryExplorer: true,
    }
  );

  const getSaveButtonMenu = useCallback(
    () => (
      <Menu>
        <Menu.Item key="to-existing-file">
          <Button onClick={() => openFileExplorer()} type="text">
            To existing file
          </Button>
        </Menu.Item>
        <Menu.Item key="to-directory">
          <Button onClick={() => openDirectoryExplorer()} type="text">
            To new file in directory
          </Button>
        </Menu.Item>
      </Menu>
    ),
    [openFileExplorer, openDirectoryExplorer]
  );

  const isLeftArrowEnabled =
    selectionHistory.length > 1 &&
    (currentSelectionHistoryIndex === undefined || (currentSelectionHistoryIndex && currentSelectionHistoryIndex > 0));
  const isRightArrowEnabled =
    selectionHistory.length > 1 &&
    currentSelectionHistoryIndex !== undefined &&
    currentSelectionHistoryIndex < selectionHistory.length - 1;

  const onClickLeftArrow = () => {
    dispatch(selectFromHistory({direction: 'left'}));
  };

  const onClickRightArrow = () => {
    dispatch(selectFromHistory({direction: 'right'}));
  };

  const applySelection = useCallback(() => {
    if (selectedValuesFileId && (!selectedResourceId || selectedValuesFileId === selectedResourceId)) {
      const helmValuesFile = helmValuesMap[selectedValuesFileId];
      if (helmValuesFile) {
        applyHelmChartWithConfirm(
          helmValuesFile,
          helmChartMap[helmValuesFile.helmChartId],
          fileMap,
          dispatch,
          kubeconfig,
          kubeconfigContext || ''
        );
      }
    } else if (selectedResource) {
      const isClusterPreview = previewType === 'cluster';
      applyResourceWithConfirm(selectedResource, resourceMap, fileMap, dispatch, kubeconfig, kubeconfigContext || '', {
        isClusterPreview,
        kustomizeCommand,
      });
    } else if (selectedPath) {
      applyFileWithConfirm(selectedPath, fileMap, dispatch, kubeconfig, kubeconfigContext || '');
    }
  }, [
    selectedResource,
    resourceMap,
    fileMap,
    kubeconfig,
    selectedPath,
    dispatch,
    previewType,
    helmChartMap,
    helmValuesMap,
    selectedValuesFileId,
    kubeconfigContext,
  ]);

  useEffect(() => {
    if (monacoEditor.apply) {
      applySelection();
      dispatch(setMonacoEditor({apply: false}));
    }
  }, [monacoEditor]);

  const diffSelectedResource = useCallback(() => {
    if (selectedResourceId) {
      dispatch(performResourceDiff(selectedResourceId));
    }
  }, [selectedResourceId, dispatch]);

  useEffect(() => {
    if (selectedResourceId && resourceMap[selectedResourceId]) {
      setSelectedResource(resourceMap[selectedResourceId]);
    } else {
      setSelectedResource(undefined);
    }
  }, [selectedResourceId, resourceMap]);

  useEffect(() => {
    if (key === 'form' && (!selectedResourceId || selectedResource?.kind !== 'ConfigMap')) {
      setKey('source');
    }
  }, [selectedResourceId, selectedResource, key]);

  const isSelectedResourceUnsaved = useCallback(() => {
    if (!selectedResource) {
      return false;
    }
    return isUnsavedResource(selectedResource);
  }, [selectedResource]);

  return (
    <>
      <Row>
        <FileExplorer {...fileExplorerProps} />
        <FileExplorer {...directoryExplorerProps} />
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <span>Editor</span>
              <RightButtons>
                <StyledLeftArrowButton
                  onClick={onClickLeftArrow}
                  disabled={!isLeftArrowEnabled}
                  type="link"
                  size="small"
                  icon={<ArrowLeftOutlined />}
                />
                <StyledRightArrowButton
                  onClick={onClickRightArrow}
                  disabled={!isRightArrowEnabled}
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                />

                {isSelectedResourceUnsaved() && (
                  <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SaveUnsavedResourceTooltip}>
                    <Dropdown overlay={getSaveButtonMenu()}>
                      <SaveButton type="primary" size="small">
                        Save
                      </SaveButton>
                    </Dropdown>
                  </Tooltip>
                )}

                <Tooltip
                  mouseEnterDelay={TOOLTIP_DELAY}
                  title={selectedPath ? ApplyFileTooltip : ApplyTooltip}
                  placement="bottomLeft"
                >
                  <Button
                    loading={Boolean(applyingResource)}
                    type="primary"
                    size="small"
                    ghost
                    onClick={applySelection}
                    disabled={
                      (!selectedResourceId && !selectedPath) ||
                      (selectedResource && isKustomizationPatch(selectedResource))
                    }
                    icon={<Icon name="kubernetes" />}
                  >
                    Deploy
                  </Button>
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DiffTooltip} placement="bottomLeft">
                  <DiffButton
                    size="small"
                    type="primary"
                    ghost
                    onClick={diffSelectedResource}
                    disabled={
                      !selectedResourceId ||
                      (selectedResource &&
                        (isKustomizationPatch(selectedResource) || isKustomizationResource(selectedResource)))
                    }
                  >
                    Diff
                  </DiffButton>
                </Tooltip>
              </RightButtons>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>

      <ActionsPaneContainer>
        <Row>
          <Col span={24}>
            <StyledTabs defaultActiveKey="source" activeKey={key} onChange={k => setKey(k)}>
              <TabPane tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>} key="source">
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <StyledSkeleton active />
                ) : (
                  !isClusterDiffVisible &&
                  (selectedResourceId || selectedPath || selectedValuesFileId) && (
                    <Monaco
                      editorHeight={`${parseInt(contentHeight, 10) - 120}`}
                      applySelection={applySelection}
                      diffSelectedResource={diffSelectedResource}
                    />
                  )
                )}
              </TabPane>
              <TabPane tab={<TabHeader icon={<ContainerOutlined />}>Metadata</TabHeader>} key="metadataForm">
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <StyledSkeleton active />
                ) : (
                  <FormEditor contentHeight={contentHeight} type="metadata" />
                )}
              </TabPane>
              {selectedResource && selectedResource?.kind === 'ConfigMap' && (
                <TabPane
                  tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}
                  disabled={!selectedResourceId}
                  key="form"
                >
                  {uiState.isFolderLoading || previewLoader.isLoading ? (
                    <StyledSkeleton active />
                  ) : (
                    <FormEditor contentHeight={contentHeight} type="resource" />
                  )}
                </TabPane>
              )}
            </StyledTabs>
          </Col>
        </Row>
      </ActionsPaneContainer>
    </>
  );
};

export default ActionsPane;
