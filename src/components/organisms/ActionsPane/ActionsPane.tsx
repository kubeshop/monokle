import {ipcRenderer} from 'electron';

import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Dropdown, Menu, Row, Tabs, Tooltip} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined, BookOutlined, CodeOutlined, ContainerOutlined} from '@ant-design/icons';

import path from 'path';

import {
  ACTIONS_PANE_FOOTER_HEIGHT,
  ACTIONS_PANE_TAB_PANE_OFFSET,
  NAVIGATOR_HEIGHT_OFFSET,
  PREVIEW_PREFIX,
  TOOLTIP_DELAY,
} from '@constants/constants';
import {
  AddResourceToExistingFileTooltip,
  ApplyFileTooltip,
  ApplyTooltip,
  DiffTooltip,
  OpenExternalDocumentationTooltip,
  SaveResourceToNewFileTooltip,
  SaveUnsavedResourceTooltip,
} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setMonacoEditor} from '@redux/reducers/ui';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {applyHelmChartWithConfirm} from '@redux/services/applyHelmChartWithConfirm';
import {applyResourceWithConfirm} from '@redux/services/applyResourceWithConfirm';
import {getRootFolder} from '@redux/services/fileEntry';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {isUnsavedResource} from '@redux/services/resource';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {saveUnsavedResource} from '@redux/thunks/saveUnsavedResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';

import FormEditor from '@molecules/FormEditor';
import Monaco from '@molecules/Monaco';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import TabHeader from '@atoms/TabHeader';

import FileExplorer from '@components/atoms/FileExplorer';
import Icon from '@components/atoms/Icon';

import {useFileExplorer} from '@hooks/useFileExplorer';

import {openExternalResourceKindDocumentation} from '@utils/shell';

import AppContext from '@src/AppContext';
import featureFlags from '@src/feature-flags.json';
import {getResourceKindHandler} from '@src/kindhandlers';
import {getFormSchema, getUiSchema} from '@src/kindhandlers/common/formLoader';

import * as S from './ActionsPane.styled';
import ActionsPaneFooter from './ActionsPaneFooter';

const {TabPane} = Tabs;

const ActionsPane = (props: {contentHeight: string}) => {
  const {contentHeight} = props;

  const {windowSize} = useContext(AppContext);
  const windowHeight = windowSize.height;
  const navigatorHeight = windowHeight - NAVIGATOR_HEIGHT_OFFSET;

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
  const isActionsPaneFooterExpanded = useAppSelector(state => state.ui.isActionsPaneFooterExpanded);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const [key, setKey] = useState('source');
  const [isButtonShrinked, setButtonCollapsedState] = useState<boolean>();

  const dispatch = useAppDispatch();

  // Could not get the ref of Tabs Component
  const tabsList = document.getElementsByClassName('ant-tabs-nav-list')[0];
  const extraButton = useRef<any>();

  const getDistanceBetweenComponents = () => {
    const tabsListEl = document.getElementsByClassName('ant-tabs-nav-list')[0].getBoundingClientRect();
    const extraButtonEl = extraButton.current.getBoundingClientRect();

    const distance = extraButtonEl.left - tabsListEl.right;

    if (isButtonShrinked) {
      // 230px = approx width of not collapsed button
      if (distance > 230) {
        setButtonCollapsedState(false);
      }
    }

    // The button has 10px margin-left
    if (!isButtonShrinked && distance < 10) {
      setButtonCollapsedState(true);
    }
  };

  const editorTabPaneHeight = useMemo(() => {
    let defaultHeight = parseInt(contentHeight, 10) - ACTIONS_PANE_TAB_PANE_OFFSET;
    if (!featureFlags.ActionsPaneFooter) {
      defaultHeight += 20;
    }
    if (isActionsPaneFooterExpanded) {
      return defaultHeight - ACTIONS_PANE_FOOTER_HEIGHT;
    }
    return defaultHeight;
  }, [contentHeight, isActionsPaneFooterExpanded]);

  const onSelect = useCallback(
    (absolutePath: string) => {
      if (selectedResource) {
        dispatch(
          saveUnsavedResource({
            resource: selectedResource,
            absolutePath,
          })
        );
      }
    },
    [selectedResource, dispatch]
  );

  const {openFileExplorer, fileExplorerProps} = useFileExplorer(
    ({existingFilePath}) => {
      if (!existingFilePath) {
        return;
      }
      onSelect(existingFilePath);
    },
    {
      title: `Add Resource ${selectedResource?.name} to file`,
      acceptedFileExtensions: ['.yaml'],
      action: 'open',
    }
  );

  const {openFileExplorer: openDirectoryExplorer, fileExplorerProps: directoryExplorerProps} = useFileExplorer(
    ({saveFilePath}) => {
      if (!saveFilePath) {
        return;
      }
      onSelect(saveFilePath);
    },
    {
      acceptedFileExtensions: ['.yaml'],
      title: `Save Resource ${selectedResource?.name} to file`,
      defaultPath: path.join(
        getRootFolder(fileMap) || '',
        `${selectedResource?.name}-${selectedResource?.kind.toLowerCase()}.yaml`
      ),
      action: 'save',
    }
  );

  const resourceKindHandler = selectedResource && getResourceKindHandler(selectedResource.kind);

  const getSaveButtonMenu = useCallback(
    () => (
      <Menu>
        <Menu.Item key="to-existing-file">
          <Tooltip title={AddResourceToExistingFileTooltip}>
            <Button onClick={() => openFileExplorer()} type="text">
              To existing file..
            </Button>
          </Tooltip>
        </Menu.Item>
        <Menu.Item key="to-directory">
          <Tooltip title={SaveResourceToNewFileTooltip}>
            <Button onClick={() => openDirectoryExplorer()} type="text">
              To new file..
            </Button>
          </Tooltip>
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
    selectFromHistory('left', currentSelectionHistoryIndex, selectionHistory, resourceMap, fileMap, dispatch);
  };

  const onClickRightArrow = () => {
    selectFromHistory('right', currentSelectionHistoryIndex, selectionHistory, resourceMap, fileMap, dispatch);
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
    kustomizeCommand,
    selectedResourceId,
  ]);

  useEffect(() => {
    if (monacoEditor.apply) {
      applySelection();
      dispatch(setMonacoEditor({apply: false}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoEditor]);

  const diffResource = useCallback(
    resourceId => {
      dispatch(performResourceDiff(resourceId));
    },
    [dispatch]
  );

  const diffSelectedResource = useCallback(() => {
    if (selectedResourceId) {
      diffResource(selectedResourceId);
    }
  }, [selectedResourceId, diffResource]);

  const onPerformResourceDiff = useCallback(
    (_: any, resourceId: string) => {
      diffResource(resourceId);
    },
    [diffResource]
  );

  const isDiffButtonDisabled = useMemo(() => {
    if (!selectedResource) {
      return true;
    }
    if (isKustomizationPatch(selectedResource) || isKustomizationResource(selectedResource)) {
      return true;
    }
    // if the resource is from the cluster preview
    if (selectedResource.filePath === PREVIEW_PREFIX + kubeconfigPath) {
      return true;
    }
    return false;
  }, [selectedResource, kubeconfigPath]);

  // called from main thread because thunks cannot be dispatched by main
  useEffect(() => {
    ipcRenderer.on('perform-resource-diff', onPerformResourceDiff);
    return () => {
      ipcRenderer.removeListener('perform-resource-diff', onPerformResourceDiff);
    };
  }, [onPerformResourceDiff]);

  useEffect(() => {
    if (selectedResourceId && resourceMap[selectedResourceId]) {
      setSelectedResource(resourceMap[selectedResourceId]);
    } else {
      setSelectedResource(undefined);
    }
  }, [selectedResourceId, resourceMap]);

  useEffect(() => {
    if (
      (key === 'metadataForm' || key === 'form') &&
      (!selectedResourceId || !(resourceKindHandler && resourceKindHandler.formEditorOptions))
    ) {
      setKey('source');
    }
  }, [selectedResourceId, selectedResource, key, resourceKindHandler]);

  const isSelectedResourceUnsaved = useCallback(() => {
    if (!selectedResource) {
      return false;
    }
    return isUnsavedResource(selectedResource);
  }, [selectedResource]);

  useEffect(() => {
    if (tabsList && extraButton.current) {
      getDistanceBetweenComponents();
    }
  }, [tabsList, extraButton.current, uiState.paneConfiguration, windowSize]);

  return (
    <>
      <Row>
        <FileExplorer {...fileExplorerProps} />
        <FileExplorer {...directoryExplorerProps} />
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <S.TitleBarContainer>
              <span>Editor</span>
              <S.RightButtons>
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

                {isSelectedResourceUnsaved() && (
                  <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SaveUnsavedResourceTooltip}>
                    <Dropdown overlay={getSaveButtonMenu()}>
                      <S.SaveButton type="primary" size="small">
                        Save
                      </S.SaveButton>
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
              </S.RightButtons>
            </S.TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>
      <S.ActionsPaneContainer $height={navigatorHeight}>
        <S.TabsContainer>
          <S.Tabs
            defaultActiveKey="source"
            activeKey={key}
            onChange={k => setKey(k)}
            tabBarExtraContent={
              selectedResource && resourceKindHandler?.helpLink ? (
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={OpenExternalDocumentationTooltip}>
                  <S.ExtraRightButton
                    onClick={() => openExternalResourceKindDocumentation(resourceKindHandler?.helpLink)}
                    type="link"
                    ghost
                    ref={extraButton}
                  >
                    {isButtonShrinked ? '' : `See ${selectedResource?.kind} documentation`} <BookOutlined />
                  </S.ExtraRightButton>
                </Tooltip>
              ) : null
            }
          >
            <TabPane
              style={{height: editorTabPaneHeight, width: '100%'}}
              tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>}
              key="source"
            >
              {uiState.isFolderLoading || previewLoader.isLoading ? (
                <S.Skeleton active />
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
            {selectedResource &&
              resourceKindHandler &&
              resourceKindHandler.formEditorOptions &&
              resourceKindHandler.formEditorOptions.editorSchema &&
              resourceKindHandler.formEditorOptions.editorUiSchema && (
                <TabPane
                  tab={<TabHeader icon={<ContainerOutlined />}>{selectedResource.kind}</TabHeader>}
                  disabled={!selectedResourceId}
                  key="form"
                >
                  {uiState.isFolderLoading || previewLoader.isLoading ? (
                    <S.Skeleton active />
                  ) : (
                    <FormEditor
                      contentHeight={contentHeight}
                      formSchema={resourceKindHandler.formEditorOptions.editorSchema}
                      formUiSchema={resourceKindHandler.formEditorOptions.editorUiSchema}
                    />
                  )}
                </TabPane>
              )}
            {selectedResource && resourceKindHandler && resourceKindHandler.kind !== 'Kustomization' && (
              <TabPane tab={<TabHeader icon={<ContainerOutlined />}>Metadata</TabHeader>} key="metadataForm">
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <S.Skeleton active />
                ) : (
                  <FormEditor
                    contentHeight={contentHeight}
                    formSchema={getFormSchema('metadata')}
                    formUiSchema={getUiSchema('metadata')}
                  />
                )}
              </TabPane>
            )}
          </S.Tabs>
        </S.TabsContainer>
        {featureFlags.ActionsPaneFooter && <ActionsPaneFooter />}
      </S.ActionsPaneContainer>
    </>
  );
};

export default ActionsPane;
