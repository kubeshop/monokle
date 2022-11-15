import {ipcRenderer} from 'electron';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {BookOutlined} from '@ant-design/icons';

import {DEFAULT_PANE_TITLE_HEIGHT, HELM_CHART_HELP_URL, KUSTOMIZE_HELP_URL, TOOLTIP_DELAY} from '@constants/constants';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';
import {
  EditWithFormTooltip,
  OpenExternalDocumentationTooltip,
  OpenHelmChartDocumentationTooltip,
  OpenKustomizeDocumentationTooltip,
} from '@constants/tooltips';

import {toggleForm} from '@redux/forms/slice';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openResourceDiffModal} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {
  currentConfigSelector,
  kubeConfigContextColorSelector,
  kubeConfigPathSelector,
  settingsSelector,
} from '@redux/selectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isHelmChartFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {getResourceSchema, getSchemaForPath, getUiSchemaForPath} from '@redux/services/schema';
import {applyHelmChart} from '@redux/thunks/applyHelmChart';
import {applyResource} from '@redux/thunks/applyResource';

import {
  FormEditor,
  HelmChartModalConfirmWithNamespaceSelect,
  ImageDetails,
  Logs,
  ModalConfirmWithNamespaceSelect,
  Monaco,
  PreviewConfigurationDetails,
  Walkthrough,
} from '@molecules';

import {Icon, TabHeader} from '@atoms';

import {MonacoPlaceholder} from '@components/molecules/MonacoPlaceholder/MonacoPlaceholder';

import {useDiff} from '@hooks/resourceHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import {openExternalResourceKindDocumentation} from '@utils/shell';

import {getResourceKindHandler} from '@src/kindhandlers';
import {extractFormSchema} from '@src/kindhandlers/common/customObjectKindHandler';

import {HelmChart, HelmValuesFile, K8sResource} from '@monokle-desktop/shared/models';
import {kubeConfigContextSelector} from '@monokle-desktop/shared/utils/selectors';

import * as S from './ActionsPane.styled';
import ActionsPaneHeader from './ActionsPaneHeader';

const ActionsPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const monacoEditor = useAppSelector(state => state.ui.monacoEditor);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedImage = useAppSelector(state => state.main.selectedImage);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const isPreviewResourceId = useAppSelector(state => Boolean(state.main.previewResourceId));

  const [activeTabKey, setActiveTabKey] = useState('source');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isButtonShrinked, setButtonShrinkedState] = useState<boolean>(true);
  const [isHelmChartApplyModalVisible, setIsHelmChartApplyModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const [schemaForSelectedPath, setSchemaForSelectedPath] = useState<any>();
  const settings = useAppSelector(settingsSelector);

  const {diffSelectedResource} = useDiff();
  const height = usePaneHeight();

  // Could not get the ref of Tabs Component
  const tabsList = document.getElementsByClassName('ant-tabs-nav-list');
  const extraButton = useRef<any>();
  const [actionsPaneRef, {width: actionsPaneWidth}] = useMeasure<HTMLDivElement>();

  const getDistanceBetweenTwoComponents = useCallback(() => {
    const tabsListEl = tabsList[0].getBoundingClientRect();
    const extraButtonEl = extraButton.current.getBoundingClientRect();

    const distance = extraButtonEl.left - tabsListEl.right;

    if (isButtonShrinked && distance > 330) {
      setButtonShrinkedState(false);
    }

    // The button has 10px margin-left
    if (!isButtonShrinked && distance < 40) {
      setButtonShrinkedState(true);
    }
  }, [isButtonShrinked, tabsList]);

  const isKustomization = useMemo(() => isKustomizationResource(selectedResource), [selectedResource]);
  const resourceKindHandler = useMemo(
    () => (selectedResource && !isKustomization ? getResourceKindHandler(selectedResource.kind) : undefined),
    [isKustomization, selectedResource]
  );

  const confirmModalTitle = useMemo(() => {
    if (!selectedResource) {
      return '';
    }

    return isKustomizationResource(selectedResource)
      ? makeApplyKustomizationText(selectedResource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(selectedResource.name, kubeConfigContext, kubeConfigContextColor);
  }, [selectedResource, kubeConfigContext, kubeConfigContextColor]);

  const helmChartConfirmModalTitle = useMemo(() => {
    if (!selectedValuesFileId) {
      return '';
    }
    const helmValuesFile: HelmValuesFile | undefined = helmValuesMap[selectedValuesFileId];

    if (!helmValuesFile) {
      return '';
    }
    const helmChart: HelmChart | undefined = helmChartMap[helmValuesFile.helmChartId];
    if (!helmChart) {
      return '';
    }
    return `Install the ${helmChart.name} Chart using ${helmValuesFile.name} in cluster [${kubeConfigContext}]?`;
  }, [helmChartMap, helmValuesMap, kubeConfigContext, selectedValuesFileId]);

  const isSchemaAvailable = useMemo(
    () =>
      schemaForSelectedPath ||
      (selectedResource && (isKustomization || resourceKindHandler?.formEditorOptions?.editorSchema)),
    [isKustomization, resourceKindHandler?.formEditorOptions?.editorSchema, schemaForSelectedPath, selectedResource]
  );

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

  const onPerformResourceDiff = useCallback(
    (_: any, resourceId: string) => {
      if (resourceId) {
        dispatch(openResourceDiffModal(resourceId));
      }
    },
    [dispatch]
  );

  const onClickApplyResource = useCallback(
    (namespace?: {name: string; new: boolean}) => {
      if (!selectedResource) {
        setIsApplyModalVisible(false);
        return;
      }
      const isClusterPreview = previewType === 'cluster';
      applyResource(selectedResource.id, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
        isClusterPreview,
      });
      setIsApplyModalVisible(false);
    },
    [dispatch, fileMap, kubeConfigContext, projectConfig, previewType, resourceMap, selectedResource]
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

  useEffect(() => {
    if (monacoEditor.apply) {
      applySelection();
      dispatch(setMonacoEditor({apply: false}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monacoEditor]);

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
    } else if (selectedPath) {
      const resources = getResourcesForPath(selectedPath, resourceMap);
      setSelectedResource(resources.length === 1 ? resources[0] : undefined);
    } else {
      setSelectedResource(undefined);
    }
  }, [selectedResourceId, resourceMap, selectedPath]);

  useEffect(() => {
    if (
      activeTabKey === 'form' &&
      (!selectedPath || !schemaForSelectedPath) &&
      !isKustomization &&
      !resourceKindHandler?.formEditorOptions?.editorSchema
    ) {
      setActiveTabKey('source');
    }

    if (activeTabKey === 'metadataForm' && (!resourceKindHandler || isKustomization)) {
      setActiveTabKey('source');
    }

    if (activeTabKey === 'logs' && selectedResource?.kind !== 'Pod') {
      setActiveTabKey('source');
    }
  }, [selectedResource, activeTabKey, resourceKindHandler, isKustomization, selectedPath, schemaForSelectedPath]);

  useEffect(() => {
    if (tabsList && tabsList.length && extraButton.current) {
      getDistanceBetweenTwoComponents();
    }
  }, [actionsPaneWidth, tabsList, paneConfiguration, selectedResource, getDistanceBetweenTwoComponents]);

  useEffect(() => {
    setSchemaForSelectedPath(selectedPath ? getSchemaForPath(selectedPath, fileMap) : undefined);
  }, [selectedPath, fileMap]);

  const tabItems = useMemo(
    () => [
      {
        key: 'source',
        label: (
          <Walkthrough placement="leftTop" step="syntax" collection="novice">
            <TabHeader>Source</TabHeader>
          </Walkthrough>
        ),
        children: (
          <>
            {isFolderLoading || previewLoader.isLoading ? (
              <S.Skeleton active />
            ) : activeTabKey === 'source' ? (
              (selectedResourceId || selectedPath || selectedValuesFileId) && (
                <Monaco applySelection={applySelection} diffSelectedResource={diffSelectedResource} />
              )
            ) : null}
          </>
        ),
        style: {height: '100%'},
      },
      ...(isSchemaAvailable
        ? [
            {
              key: 'form',
              label: <TabHeader>Form</TabHeader>,
              children: (
                <>
                  {isFolderLoading || previewLoader.isLoading ? (
                    <S.Skeleton active />
                  ) : activeTabKey === 'form' ? (
                    selectedPath && schemaForSelectedPath && !selectedResource ? (
                      <FormEditor
                        formSchema={extractFormSchema(schemaForSelectedPath)}
                        formUiSchema={getUiSchemaForPath(selectedPath)}
                      />
                    ) : isKustomization && selectedResource ? (
                      <FormEditor
                        formSchema={extractFormSchema(
                          getResourceSchema(selectedResource, String(k8sVersion), String(userDataDir))
                        )}
                      />
                    ) : resourceKindHandler?.formEditorOptions ? (
                      <FormEditor
                        formSchema={resourceKindHandler.formEditorOptions.editorSchema}
                        formUiSchema={resourceKindHandler.formEditorOptions.editorUiSchema}
                      />
                    ) : null
                  ) : null}
                </>
              ),
              style: {height: '100%'},
            },
          ]
        : []),
      ...(selectedResource?.kind === 'Pod' && isPreviewResourceId
        ? [
            {
              key: 'logs',
              label: <TabHeader>Logs</TabHeader>,
              children: (
                <>
                  {isFolderLoading || previewLoader.isLoading ? (
                    <S.Skeleton active />
                  ) : activeTabKey === 'logs' ? (
                    <Logs />
                  ) : null}
                </>
              ),
              style: {height: '100%'},
            },
          ]
        : []),
    ],
    [
      activeTabKey,
      applySelection,
      diffSelectedResource,
      isFolderLoading,
      isKustomization,
      isPreviewResourceId,
      isSchemaAvailable,
      k8sVersion,
      previewLoader.isLoading,
      resourceKindHandler,
      schemaForSelectedPath,
      selectedPath,
      selectedResource,
      selectedResourceId,
      selectedValuesFileId,
      userDataDir,
    ]
  );

  return (
    <S.ActionsPaneMainContainer ref={actionsPaneRef} id="EditorPane" $height={height}>
      <ActionsPaneHeader
        actionsPaneWidth={actionsPaneWidth}
        applySelection={applySelection}
        selectedResource={selectedResource}
      />

      {selectedPreviewConfigurationId ? (
        <PreviewConfigurationDetails />
      ) : selectedImage ? (
        <ImageDetails />
      ) : selectedResourceId || selectedPath || selectedValuesFileId ? (
        <S.Tabs
          $height={height - DEFAULT_PANE_TITLE_HEIGHT}
          defaultActiveKey="source"
          activeKey={activeTabKey}
          items={tabItems}
          onChange={k => setActiveTabKey(k)}
          tabBarExtraContent={
            selectedResource && resourceKindHandler?.helpLink ? (
              <>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={EditWithFormTooltip}>
                  <S.ExtraRightButton
                    disabled={!isSchemaAvailable}
                    type="link"
                    onClick={() => dispatch(toggleForm(true))}
                    ref={extraButton}
                  >
                    <Icon name="split-view" />
                  </S.ExtraRightButton>
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={OpenExternalDocumentationTooltip}>
                  <S.ExtraRightButton
                    onClick={() => openExternalResourceKindDocumentation(resourceKindHandler?.helpLink)}
                    type="link"
                    ref={extraButton}
                  >
                    <BookOutlined />
                  </S.ExtraRightButton>
                </Tooltip>
              </>
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
            ) : selectedPath && isHelmChartFile(selectedPath) ? (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={OpenHelmChartDocumentationTooltip}>
                <S.ExtraRightButton
                  onClick={() => openExternalResourceKindDocumentation(HELM_CHART_HELP_URL)}
                  type="link"
                  ref={extraButton}
                >
                  {isButtonShrinked ? '' : `See Helm Chart documentation`} <BookOutlined />
                </S.ExtraRightButton>
              </Tooltip>
            ) : null
          }
        />
      ) : (
        !settings.hideEditorPlaceholder && (isFolderLoading ? <S.Skeleton active /> : <MonacoPlaceholder />)
      )}

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
