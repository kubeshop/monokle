import {ipcRenderer} from 'electron';

import {LegacyRef, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ResizableBox} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Button, Tabs, Tooltip} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined, BookOutlined, CodeOutlined, ContainerOutlined} from '@ant-design/icons';

import {
  ACTIONS_PANE_FOOTER_DEFAULT_HEIGHT,
  ACTIONS_PANE_FOOTER_EXPANDED_DEFAULT_HEIGHT,
  KUSTOMIZE_HELP_URL,
  TOOLTIP_DELAY,
} from '@constants/constants';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';
import {
  ApplyFileTooltip,
  ApplyTooltip,
  DiffTooltip,
  OpenExternalDocumentationTooltip,
  OpenKustomizeDocumentationTooltip,
  SaveUnsavedResourceTooltip,
} from '@constants/tooltips';

import {AlertEnum, AlertType} from '@models/alert';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openResourceDiffModal} from '@redux/reducers/main';
import {openSaveResourcesToFileFolderModal, setMonacoEditor, setPaneConfiguration} from '@redux/reducers/ui';
import {
  knownResourceKindsSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  settingsSelector,
} from '@redux/selectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {isKustomizationPatch, isKustomizationResource} from '@redux/services/kustomize';
import {isUnsavedResource} from '@redux/services/resource';
import {getResourceSchema, getSchemaForPath, getUiSchemaForPath} from '@redux/services/schema';
import {applyHelmChart} from '@redux/thunks/applyHelmChart';
import {applyResource} from '@redux/thunks/applyResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';

import {
  FormEditor,
  HelmChartModalConfirmWithNamespaceSelect,
  ModalConfirmWithNamespaceSelect,
  Monaco,
  TitleBar,
} from '@molecules';

import {Icon, TabHeader} from '@atoms';

import {openExternalResourceKindDocumentation} from '@utils/shell';

import featureFlags from '@src/feature-flags.json';
import {getResourceKindHandler} from '@src/kindhandlers';
import {extractFormSchema} from '@src/kindhandlers/common/customObjectKindHandler';
import {getFormSchema, getUiSchema} from '@src/kindhandlers/common/formLoader';

import * as S from './ActionsPane.styled';
import ActionsPaneFooter from './ActionsPaneFooter';

const {TabPane} = Tabs;

interface IProps {
  contentHeight: number;
}

const ActionsPane: React.FC<IProps> = props => {
  const {contentHeight} = props;

  const dispatch = useAppDispatch();
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isActionsPaneFooterExpanded = useAppSelector(state => state.ui.isActionsPaneFooterExpanded);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const {kustomizeCommand} = useAppSelector(settingsSelector);
  const knownResourceKinds = useAppSelector(knownResourceKindsSelector);
  const monacoEditor = useAppSelector(state => state.ui.monacoEditor);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);

  const [activeTabKey, setActiveTabKey] = useState('source');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isButtonShrinked, setButtonShrinkedState] = useState<boolean>(true);
  const [isHelmChartApplyModalVisible, setIsHelmChartApplyModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const [schemaForSelectedPath, setSchemaForSelectedPath] = useState<any>();
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);

  // Could not get the ref of Tabs Component
  const tabsList = document.getElementsByClassName('ant-tabs-nav-list');
  const extraButton = useRef<any>();

  const [actionsPaneFooterRef, {height: actionsPaneFooterHeight, width: actionsPaneFooterWidth}] =
    useMeasure<HTMLDivElement>();
  const [actionsPaneRef, {width: actionsPaneWidth}] = useMeasure<HTMLDivElement>();
  const [titleBarRef, {height: titleBarHeight}] = useMeasure<HTMLDivElement>();

  const getDistanceBetweenTwoComponents = useCallback(() => {
    const tabsListEl = tabsList[0].getBoundingClientRect();
    const extraButtonEl = extraButton.current.getBoundingClientRect();

    const distance = extraButtonEl.left - tabsListEl.right;

    if (isButtonShrinked && distance > 280) {
      setButtonShrinkedState(false);
    }

    // The button has 10px margin-left
    if (!isButtonShrinked && distance < 40) {
      setButtonShrinkedState(true);
    }
  }, [isButtonShrinked, tabsList]);

  const resizableBoxHeight = useMemo(() => {
    if (isActionsPaneFooterExpanded) {
      if (actionsPaneFooterHeight >= ACTIONS_PANE_FOOTER_EXPANDED_DEFAULT_HEIGHT) {
        return actionsPaneFooterHeight;
      }

      return paneConfiguration.actionsPaneFooterExpandedHeight || ACTIONS_PANE_FOOTER_EXPANDED_DEFAULT_HEIGHT;
    }

    if (featureFlags.ActionsPaneFooter) {
      return ACTIONS_PANE_FOOTER_DEFAULT_HEIGHT;
    }

    return 0;
  }, [actionsPaneFooterHeight, isActionsPaneFooterExpanded, paneConfiguration.actionsPaneFooterExpandedHeight]);

  const tabsHeight = useMemo(
    () => contentHeight - resizableBoxHeight - titleBarHeight,
    [contentHeight, resizableBoxHeight, titleBarHeight]
  );

  const onSaveHandler = () => {
    if (selectedResource) {
      dispatch(openSaveResourcesToFileFolderModal([selectedResource.id]));
    }
  };

  const isKustomization = isKustomizationResource(selectedResource);
  const resourceKindHandler =
    selectedResource && !isKustomization ? getResourceKindHandler(selectedResource.kind) : undefined;

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

  const resizeActionsPaneFooter = useCallback(() => {
    if (isActionsPaneFooterExpanded && actionsPaneFooterHeight !== paneConfiguration.actionsPaneFooterExpandedHeight) {
      dispatch(setPaneConfiguration({...paneConfiguration, actionsPaneFooterExpandedHeight: actionsPaneFooterHeight}));
    }
  }, [actionsPaneFooterHeight, dispatch, isActionsPaneFooterExpanded, paneConfiguration]);

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
    (namespace?: {name: string; new: boolean}) => {
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
      activeTabKey === 'form' &&
      !selectedPath &&
      !isKustomization &&
      !resourceKindHandler?.formEditorOptions?.editorSchema
    ) {
      setActiveTabKey('source');
    }

    if (activeTabKey === 'metadataForm' && (!resourceKindHandler || isKustomization)) {
      setActiveTabKey('source');
    }
  }, [selectedResource, activeTabKey, resourceKindHandler, isKustomization, selectedPath]);

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
  }, [actionsPaneWidth, tabsList, paneConfiguration, selectedResource, getDistanceBetweenTwoComponents]);

  useEffect(() => {
    setSchemaForSelectedPath(selectedPath ? getSchemaForPath(selectedPath, fileMap) : undefined);
  }, [selectedPath, fileMap]);

  return (
    <S.ActionsPaneMainContainer ref={actionsPaneRef}>
      <div ref={titleBarRef}>
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
          </>
        </TitleBar>
      </div>

      <S.ActionsPaneContainer>
        <S.Tabs
          $height={tabsHeight}
          $width={actionsPaneWidth}
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
            ) : isKustomization ? (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={OpenKustomizeDocumentationTooltip}>
                <S.ExtraRightButton
                  onClick={() => openExternalResourceKindDocumentation(KUSTOMIZE_HELP_URL)}
                  type="link"
                  ref={extraButton}
                >
                  {isButtonShrinked ? '' : `See Kustomization documentation`} <BookOutlined />
                </S.ExtraRightButton>
              </Tooltip>
            ) : null
          }
        >
          <TabPane key="source" tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>}>
            {isFolderLoading || previewLoader.isLoading ? (
              <S.Skeleton active />
            ) : activeTabKey === 'source' ? (
              !isClusterDiffVisible &&
              (selectedResourceId || selectedPath || selectedValuesFileId) && (
                <Monaco applySelection={applySelection} diffSelectedResource={diffSelectedResource} />
              )
            ) : null}
          </TabPane>

          {schemaForSelectedPath ||
          (selectedResource && (isKustomization || resourceKindHandler?.formEditorOptions?.editorSchema)) ? (
            <TabPane
              key="form"
              tab={
                <TabHeader icon={<ContainerOutlined />}>{selectedResource ? selectedResource.kind : 'Form'}</TabHeader>
              }
            >
              {isFolderLoading || previewLoader.isLoading ? (
                <S.Skeleton active />
              ) : activeTabKey === 'form' ? (
                selectedPath && schemaForSelectedPath ? (
                  <FormEditor
                    formSchema={extractFormSchema(schemaForSelectedPath)}
                    formUiSchema={getUiSchemaForPath(selectedPath, fileMap)}
                  />
                ) : isKustomization && selectedResource ? (
                  <FormEditor formSchema={extractFormSchema(getResourceSchema(selectedResource, String(k8sVersion)))} />
                ) : resourceKindHandler?.formEditorOptions ? (
                  <FormEditor
                    formSchema={resourceKindHandler.formEditorOptions.editorSchema}
                    formUiSchema={resourceKindHandler.formEditorOptions.editorUiSchema}
                  />
                ) : null
              ) : null}
            </TabPane>
          ) : null}

          {selectedResource && resourceKindHandler && !isKustomization && (
            <TabPane key="metadataForm" tab={<TabHeader icon={<ContainerOutlined />}>Metadata</TabHeader>}>
              {isFolderLoading || previewLoader.isLoading ? (
                <S.Skeleton active />
              ) : activeTabKey === 'metadataForm' ? (
                <FormEditor formSchema={getFormSchema('metadata')} formUiSchema={getUiSchema('metadata')} />
              ) : null}
            </TabPane>
          )}
        </S.Tabs>

        {featureFlags.ActionsPaneFooter && (
          <S.ActionsPaneFooterContainer ref={actionsPaneFooterRef}>
            <ResizableBox
              height={resizableBoxHeight}
              width={actionsPaneFooterWidth}
              axis="y"
              resizeHandles={['n']}
              minConstraints={[
                actionsPaneFooterWidth,
                isActionsPaneFooterExpanded
                  ? ACTIONS_PANE_FOOTER_EXPANDED_DEFAULT_HEIGHT
                  : ACTIONS_PANE_FOOTER_DEFAULT_HEIGHT,
              ]}
              maxConstraints={[actionsPaneFooterWidth, contentHeight - 300]}
              handle={(h: number, ref: LegacyRef<HTMLSpanElement>) => (
                <span className={isActionsPaneFooterExpanded ? 'custom-handle' : ''} ref={ref} />
              )}
              onResizeStop={resizeActionsPaneFooter}
            >
              <ActionsPaneFooter
                tabs={{
                  terminal: {title: 'Terminal', content: <>Terminal content</>},
                  documentation: {title: 'Documentation', content: <>Documentation content</>},
                }}
              />
            </ResizableBox>
          </S.ActionsPaneFooterContainer>
        )}
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
    </S.ActionsPaneMainContainer>
  );
};

export default ActionsPane;
