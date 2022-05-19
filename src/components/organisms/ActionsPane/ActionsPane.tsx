import {ipcRenderer} from 'electron';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ReflexContainer, ReflexElement} from 'react-reflex';
import {useMeasure} from 'react-use';

import {Tabs, Tooltip} from 'antd';

import {BookOutlined, CodeOutlined, ContainerOutlined} from '@ant-design/icons';

import {HELM_CHART_HELP_URL, KUSTOMIZE_HELP_URL, TOOLTIP_DELAY} from '@constants/constants';
import {makeApplyKustomizationText, makeApplyResourceText} from '@constants/makeApplyText';
import {
  OpenExternalDocumentationTooltip,
  OpenHelmChartDocumentationTooltip,
  OpenKustomizeDocumentationTooltip,
} from '@constants/tooltips';

import {AlertEnum, AlertType} from '@models/alert';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {openResourceDiffModal} from '@redux/reducers/main';
import {setMonacoEditor} from '@redux/reducers/ui';
import {currentConfigSelector, kubeConfigContextSelector, kubeConfigPathSelector} from '@redux/selectors';
import {getResourcesForPath} from '@redux/services/fileEntry';
import {isHelmChartFile} from '@redux/services/helm';
import {isKustomizationResource} from '@redux/services/kustomize';
import {getResourceSchema, getSchemaForPath, getUiSchemaForPath} from '@redux/services/schema';
import {applyFileWithConfirm} from '@redux/support/applyFileWithConfirm';
import {applyHelmChart} from '@redux/thunks/applyHelmChart';
import {applyResource} from '@redux/thunks/applyResource';

import {
  DockerImageDetails,
  FormEditor,
  HelmChartModalConfirmWithNamespaceSelect,
  ModalConfirmWithNamespaceSelect,
  Monaco,
  PreviewConfigurationDetails,
} from '@molecules';

import {TabHeader} from '@atoms';

import WalkThrough from '@components/molecules/WalkThrough';

import {openExternalResourceKindDocumentation} from '@utils/shell';

import {getResourceKindHandler} from '@src/kindhandlers';
import {extractFormSchema} from '@src/kindhandlers/common/customObjectKindHandler';
import {getFormSchema, getUiSchema} from '@src/kindhandlers/common/formLoader';

import * as S from './ActionsPane.styled';
import ActionsPaneHeader from './ActionsPaneHeader';

const {TabPane} = Tabs;

type Props = {
  height: number;
};

const ActionsPane: React.FC<Props> = ({height}) => {
  const dispatch = useAppDispatch();
  const fileMap = useAppSelector(state => state.main.fileMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const monacoEditor = useAppSelector(state => state.ui.monacoEditor);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedDockerImage = useAppSelector(state => state.main.selectedDockerImage);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const selectedPreviewConfigurationId = useAppSelector(state => state.main.selectedPreviewConfigurationId);
  const userDataDir = useAppSelector(state => state.config.userDataDir);

  const [activeTabKey, setActiveTabKey] = useState('source');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isButtonShrinked, setButtonShrinkedState] = useState<boolean>(true);
  const [isHelmChartApplyModalVisible, setIsHelmChartApplyModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const [schemaForSelectedPath, setSchemaForSelectedPath] = useState<any>();

  // Could not get the ref of Tabs Component
  const tabsList = document.getElementsByClassName('ant-tabs-nav-list');
  const extraButton = useRef<any>();
  const [actionsPaneRef, {width: actionsPaneWidth}] = useMeasure<HTMLDivElement>();

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

  const isKustomization = isKustomizationResource(selectedResource);
  const resourceKindHandler =
    selectedResource && !isKustomization ? getResourceKindHandler(selectedResource.kind) : undefined;

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
  }, [selectedResource, activeTabKey, resourceKindHandler, isKustomization, selectedPath, schemaForSelectedPath]);

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
      <ActionsPaneHeader
        selectedResource={selectedResource}
        applySelection={applySelection}
        diffSelectedResource={diffSelectedResource}
      />

      <ReflexContainer orientation="horizontal" style={{height: height - 40}}>
        <ReflexElement flex={1.0}>
          {selectedPreviewConfigurationId ? (
            <PreviewConfigurationDetails />
          ) : selectedDockerImage ? (
            <DockerImageDetails />
          ) : (
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
            >
              <TabPane
                key="source"
                tab={
                  <WalkThrough placement="leftTop" step="syntax" collection="novice">
                    <TabHeader icon={<CodeOutlined />}>Source</TabHeader>
                  </WalkThrough>
                }
              >
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
                <TabPane key="form" tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}>
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
          )}
        </ReflexElement>
      </ReflexContainer>

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
