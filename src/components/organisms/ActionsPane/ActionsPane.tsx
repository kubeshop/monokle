import {ipcRenderer} from 'electron';

import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

import {Button, Row, Tabs, Tooltip} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined, BookOutlined, CodeOutlined, ContainerOutlined} from '@ant-design/icons';

import {
  ACTIONS_PANE_FOOTER_HEIGHT,
  ACTIONS_PANE_TAB_PANE_OFFSET,
  NAVIGATOR_HEIGHT_OFFSET,
  TOOLTIP_DELAY,
} from '@constants/constants';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';
import {
  ApplyFileTooltip,
  ApplyTooltip,
  DiffTooltip,
  OpenExternalDocumentationTooltip,
  SaveUnsavedResourceTooltip,
} from '@constants/tooltips';

import {AlertEnum, AlertType} from '@models/alert';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openResourceDiffModal} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal, setMonacoEditor} from '@redux/reducers/ui';
import {
  isInPreviewModeSelector,
  knownResourceKindsSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  settingsSelector,
} from '@redux/selectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {isUnsavedResource} from '@redux/services/resource';
import {applyHelmChart} from '@redux/thunks/applyHelmChart';
import {applyResource} from '@redux/thunks/applyResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';

import FormEditor from '@molecules/FormEditor';
import Monaco from '@molecules/Monaco';

import {MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import TabHeader from '@atoms/TabHeader';

import Icon from '@components/atoms/Icon';
import HelmChartModalConfirmWithNamespaceSelect from '@components/molecules/HelmChartModalConfirmWithNamespaceSelect';
import ModalConfirmWithNamespaceSelect from '@components/molecules/ModalConfirmWithNamespaceSelect';

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

  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);
  const previewType = useAppSelector(state => state.main.previewType);
  const monacoEditor = useAppSelector(state => state.ui.monacoEditor);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isActionsPaneFooterExpanded = useAppSelector(state => state.ui.isActionsPaneFooterExpanded);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const {kustomizeCommand} = useAppSelector(settingsSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);

  const navigatorHeight = useMemo(
    () => windowHeight - NAVIGATOR_HEIGHT_OFFSET - (isInPreviewMode ? 25 : 0),
    [windowHeight, isInPreviewMode]
  );

  const [activeTabKey, setActiveTabKey] = useState('source');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isButtonShrinked, setButtonShrinkedState] = useState<boolean>(true);
  const [isHelmChartApplyModalVisible, setIsHelmChartApplyModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();

  const dispatch = useAppDispatch();

  // Could not get the ref of Tabs Component
  const tabsList = document.getElementsByClassName('ant-tabs-nav-list');
  const extraButton = useRef<any>();

  const getDistanceBetweenTwoComponents = useCallback(() => {
    const tabsListEl = tabsList[0].getBoundingClientRect();
    const extraButtonEl = extraButton.current.getBoundingClientRect();

    const distance = extraButtonEl.left - tabsListEl.right;

    if (isButtonShrinked) {
      // 230px = approx width of not collapsed button
      if (distance > 350) {
        setButtonShrinkedState(false);
      }
    }

    // The button has 10px margin-left
    if (!isButtonShrinked && distance < 40) {
      setButtonShrinkedState(true);
    }
  }, [isButtonShrinked, tabsList]);

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

  const onSaveHandler = () => {
    if (selectedResource) {
      dispatch(openSaveResourcesToFileFolderModal([selectedResource.id]));
    }
  };

  const resourceKindHandler = selectedResource && getResourceKindHandler(selectedResource.kind);

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
        setIsHelmChartApplyModalVisible(true);
      }
    } else if (selectedResource) {
      setIsApplyModalVisible(true);
    } else if (selectedPath) {
      applyFileWithConfirm(selectedPath, fileMap, dispatch, kubeConfigPath, kubeConfigContext);
    }
  }, [
    selectedResource,
    fileMap,
    kubeConfigPath,
    selectedPath,
    dispatch,
    helmValuesMap,
    selectedValuesFileId,
    kubeConfigContext,
    selectedResourceId,
  ]);

  useEffect(() => {
    if (monacoEditor.apply) {
      applySelection();
      dispatch(setMonacoEditor({apply: false}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoEditor]);

  const diffSelectedResource = useCallback(() => {
    if (!kubeConfigContext || kubeConfigContext === '') {
      const alert: AlertType = {
        type: AlertEnum.Error,
        title: 'Diff not available',
        message: 'No Cluster Configured',
      };

      dispatch(setAlert(alert));
      return;
    }

    if (selectedResourceId) {
      dispatch(openResourceDiffModal(selectedResourceId));
    }
  }, [dispatch, selectedResourceId, kubeConfigContext]);

  const onPerformResourceDiff = useCallback(
    (_: any, resourceId: string) => {
      if (resourceId) {
        dispatch(openResourceDiffModal(resourceId));
      }
    },
    [dispatch]
  );

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

  const onClickApplyResource = useCallback(
    (namespace?: string) => {
      if (!selectedResource) {
        setIsApplyModalVisible(false);
        return;
      }
      const isClusterPreview = previewType === 'cluster';
      applyResource(selectedResource.id, resourceMap, fileMap, dispatch, kubeConfigPath, kubeConfigContext, namespace, {
        isClusterPreview,
        kustomizeCommand,
      });
      setIsApplyModalVisible(false);
    },
    [dispatch, fileMap, kubeConfigContext, kubeConfigPath, kustomizeCommand, previewType, resourceMap, selectedResource]
  );

  const onClickApplyHelmChart = useCallback(
    (namespace?: string, shouldCreateNamespace?: boolean) => {
      if (!selectedValuesFileId) {
        setIsHelmChartApplyModalVisible(false);
        return;
      }

      const helmValuesFile = helmValuesMap[selectedValuesFileId];
      applyHelmChart(
        helmValuesFile,
        helmChartMap[helmValuesFile.helmChartId],
        fileMap,
        dispatch,
        kubeConfigPath,
        kubeConfigContext,
        namespace,
        shouldCreateNamespace
      );
      setIsHelmChartApplyModalVisible(false);
    },
    [dispatch, fileMap, helmChartMap, helmValuesMap, kubeConfigPath, kubeConfigContext, selectedValuesFileId]
  );

  const confirmModalTitle = useMemo(() => {
    if (!selectedResource) {
      return '';
    }

    return isKustomizationResource(selectedResource)
      ? makeApplyKustomizationText(selectedResource.name, kubeConfigContext)
      : makeApplyResourceText(selectedResource.name, kubeConfigContext);
  }, [selectedResource, kubeConfigContext]);

  const helmChartConfirmModalTitle = useMemo(() => {
    if (!selectedValuesFileId) {
      return '';
    }

    const helmValuesFile = helmValuesMap[selectedValuesFileId];

    return `Install the ${helmChartMap[helmValuesFile.helmChartId].name} Chart using ${
      helmValuesFile.name
    } in cluster [${kubeConfigContext}]?`;
  }, [helmChartMap, helmValuesMap, kubeConfigContext, selectedValuesFileId]);

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
      (activeTabKey === 'metadataForm' || activeTabKey === 'form') &&
      (!selectedResourceId || !(resourceKindHandler && resourceKindHandler.formEditorOptions))
    ) {
      setActiveTabKey('source');
    }
  }, [selectedResourceId, selectedResource, activeTabKey, resourceKindHandler]);

  const isSelectedResourceUnsaved = useCallback(() => {
    if (!selectedResource) {
      return false;
    }
    return isUnsavedResource(selectedResource);
  }, [selectedResource]);

  useEffect(() => {
    if (tabsList && tabsList.length && extraButton.current) {
      getDistanceBetweenTwoComponents();
    }
  }, [tabsList, uiState.paneConfiguration, windowSize, selectedResource, getDistanceBetweenTwoComponents]);

  return (
    <>
      <Row>
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
                    <S.SaveButton type="primary" size="small" onClick={onSaveHandler}>
                      Save
                    </S.SaveButton>
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
                      (selectedResource &&
                        (isKustomizationPatch(selectedResource) || !knownResourceKinds.includes(selectedResource.kind)))
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
            activeKey={activeTabKey}
            onChange={k => setActiveTabKey(k)}
            tabBarExtraContent={
              selectedResource && resourceKindHandler?.helpLink ? (
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={OpenExternalDocumentationTooltip}>
                  <S.ExtraRightButton
                    onClick={() => openExternalResourceKindDocumentation(resourceKindHandler?.helpLink)}
                    type="link"
                    ref={extraButton}
                  >
                    {isButtonShrinked ? '' : `See ${selectedResource?.kind} documentation`} <BookOutlined />
                  </S.ExtraRightButton>
                </Tooltip>
              ) : null
            }
          >
            <TabPane
              key="source"
              style={{height: editorTabPaneHeight}}
              tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>}
            >
              {uiState.isFolderLoading || previewLoader.isLoading ? (
                <S.Skeleton active />
              ) : (
                !isClusterDiffVisible &&
                (selectedResourceId || selectedPath || selectedValuesFileId) && (
                  <Monaco applySelection={applySelection} diffSelectedResource={diffSelectedResource} />
                )
              )}
            </TabPane>
            {selectedResource && resourceKindHandler?.formEditorOptions?.editorSchema && (
              <TabPane
                disabled={!selectedResourceId}
                key="form"
                style={{height: editorTabPaneHeight}}
                tab={<TabHeader icon={<ContainerOutlined />}>{selectedResource.kind}</TabHeader>}
              >
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <S.Skeleton active />
                ) : activeTabKey === 'form' ? (
                  <FormEditor
                    formSchema={resourceKindHandler.formEditorOptions.editorSchema}
                    formUiSchema={resourceKindHandler.formEditorOptions.editorUiSchema}
                  />
                ) : null}
              </TabPane>
            )}
            {selectedResource && resourceKindHandler && !isKustomizationResource(selectedResource) && (
              <TabPane
                key="metadataForm"
                style={{height: editorTabPaneHeight}}
                tab={<TabHeader icon={<ContainerOutlined />}>Metadata</TabHeader>}
              >
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <S.Skeleton active />
                ) : activeTabKey === 'metadataForm' ? (
                  <FormEditor formSchema={getFormSchema('metadata')} formUiSchema={getUiSchema('metadata')} />
                ) : null}
              </TabPane>
            )}
          </S.Tabs>
        </S.TabsContainer>
        {featureFlags.ActionsPaneFooter && <ActionsPaneFooter />}
      </S.ActionsPaneContainer>

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resources={selectedResource ? [selectedResource] : []}
          title={confirmModalTitle}
          onOk={selectedNamespace => onClickApplyResource(selectedNamespace)}
          onCancel={() => setIsApplyModalVisible(false)}
        />
      )}

      {isHelmChartApplyModalVisible && (
        <HelmChartModalConfirmWithNamespaceSelect
          isVisible={isHelmChartApplyModalVisible}
          title={helmChartConfirmModalTitle}
          onCancel={() => setIsHelmChartApplyModalVisible(false)}
          onOk={(selectedNamespace, shouldCreateNamespace) =>
            onClickApplyHelmChart(selectedNamespace, shouldCreateNamespace)
          }
        />
      )}
    </>
  );
};

export default ActionsPane;
