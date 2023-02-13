import {ipcRenderer} from 'electron';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useStore} from 'react-redux';
import {useMeasure} from 'react-use';

import {Tooltip} from 'antd';

import {BookOutlined} from '@ant-design/icons';

import {createSelector} from 'reselect';

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
  isInClusterModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigPathSelector,
  selectedFilePathSelector,
  selectedHelmValuesSelector,
  settingsSelector,
} from '@redux/selectors';
import {getResourceMapFromState} from '@redux/selectors/resourceMapGetters';
import {useSelectedResource} from '@redux/selectors/resourceSelectors';
import {applyFileWithConfirm} from '@redux/services/applyFileWithConfirm';
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

import {TabHeader} from '@atoms';

import {MonacoPlaceholder} from '@components/molecules/MonacoPlaceholder/MonacoPlaceholder';

import {useDiff} from '@hooks/resourceHooks';
import {usePaneHeight} from '@hooks/usePaneHeight';

import {useSelectorWithRef} from '@utils/hooks';

import {getResourceKindHandler} from '@src/kindhandlers';
import {extractFormSchema} from '@src/kindhandlers/common/customObjectKindHandler';

import {Icon} from '@monokle/components';
import {HelmChart} from '@shared/models/helm';
import {RootState} from '@shared/models/rootState';
import {kubeConfigContextSelector} from '@shared/utils/selectors';
import {openExternalResourceKindDocumentation} from '@shared/utils/shell';

import * as S from './ActionsPane.styled';
import ActionsPaneHeader from './ActionsPaneHeader';

const hideEditorPlaceholderSelector = createSelector(settingsSelector, settings => settings.hideEditorPlaceholder);

// TODO: we should also check if the selectedFile entry has only one resource and if so, to set the selectedResource to be that for this component
const ActionsPane: React.FC = () => {
  const dispatch = useAppDispatch();
  const [fileMap, fileMapRef] = useSelectorWithRef(state => state.main.fileMap);
  const [, kubeConfigPathRef] = useSelectorWithRef(kubeConfigPathSelector);
  const [kubeConfigContext, kubeConfigContextRef] = useSelectorWithRef(kubeConfigContextSelector);
  const [, projectConfigRef] = useSelectorWithRef(currentConfigSelector);

  const store = useStore();

  const [helmChartMap, helmChartMapRef] = useSelectorWithRef(state => state.main.helmChartMap);
  const isFolderLoading = useAppSelector(state => state.ui.isFolderLoading);
  const k8sVersion = useAppSelector(state => state.config.projectConfig?.k8sVersion);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const monacoEditor = useAppSelector(state => state.ui.monacoEditor);
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const selectedFilePath = useAppSelector(selectedFilePathSelector);
  const selectedHelmValues = useAppSelector(selectedHelmValuesSelector);
  const isClusterModeLoading = useAppSelector(state => state.main.clusterConnectionOptions.isLoading);
  const selectedResource = useSelectedResource();
  const selectedResourceRef = useRef(selectedResource);
  selectedResourceRef.current = selectedResource;

  const selectedResourceId = selectedResource?.id;
  const selectedHelmValuesId = selectedHelmValues?.id;

  const selection = useAppSelector(state => state.main.selection);
  const userDataDir = useAppSelector(state => state.config.userDataDir);
  const [isInClusterMode, isInClusterModeRef] = useSelectorWithRef(isInClusterModeSelector);

  const [activeTabKey, setActiveTabKey] = useState('source');
  const [isApplyModalVisible, setIsApplyModalVisible] = useState(false);
  const [isButtonShrinked, setButtonShrinkedState] = useState<boolean>(true);
  const [isHelmChartApplyModalVisible, setIsHelmChartApplyModalVisible] = useState(false);
  const [schemaForSelectedPath, setSchemaForSelectedPath] = useState<any>();
  const hideEditorPlaceholder = useAppSelector(hideEditorPlaceholderSelector);

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

  const isKustomization = useMemo(
    () => (selectedResourceId ? isKustomizationResource(selectedResourceRef.current) : false),
    [selectedResourceId, selectedResourceRef]
  );
  const resourceKindHandler = useMemo(() => {
    const resourceKind = selectedResourceRef.current?.kind;
    return selectedResourceId && !isKustomization && resourceKind ? getResourceKindHandler(resourceKind) : undefined;
  }, [isKustomization, selectedResourceId, selectedResourceRef]);

  const confirmModalTitle = useMemo(() => {
    if (!selectedResource) {
      return '';
    }

    return isKustomizationResource(selectedResource)
      ? makeApplyKustomizationText(selectedResource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(selectedResource.name, kubeConfigContext, kubeConfigContextColor);
  }, [selectedResource, kubeConfigContext, kubeConfigContextColor]);

  const helmChartConfirmModalTitle = useMemo(() => {
    if (!selectedHelmValues) {
      return '';
    }
    const helmChart: HelmChart | undefined = helmChartMap[selectedHelmValues.helmChartId];
    if (!helmChart) {
      return '';
    }
    return `Install the ${helmChart.name} Chart using ${selectedHelmValues.name} in cluster [${kubeConfigContext}]?`;
  }, [helmChartMap, kubeConfigContext, selectedHelmValues]);

  const isSchemaAvailable = useMemo(
    () =>
      schemaForSelectedPath ||
      (selectedResource && (isKustomization || resourceKindHandler?.formEditorOptions?.editorSchema)),
    [isKustomization, resourceKindHandler?.formEditorOptions?.editorSchema, schemaForSelectedPath, selectedResource]
  );

  const applySelection = useCallback(() => {
    if (selectedHelmValuesId) {
      setIsHelmChartApplyModalVisible(true);
    } else if (selectedResourceId) {
      setIsApplyModalVisible(true);
    } else if (selectedFilePath) {
      applyFileWithConfirm(
        selectedFilePath,
        fileMapRef.current,
        dispatch,
        kubeConfigPathRef.current,
        kubeConfigContextRef.current
      );
    }
  }, [
    selectedResourceId,
    selectedHelmValuesId,
    selectedFilePath,
    dispatch,
    fileMapRef,
    kubeConfigPathRef,
    kubeConfigContextRef,
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
      const resourceMap = getResourceMapFromState(store.getState() as RootState, selectedResource?.storage);
      applyResource(
        selectedResource.id,
        resourceMap,
        fileMapRef.current,
        dispatch,
        projectConfigRef.current,
        kubeConfigContextRef.current,
        namespace,
        {
          isInClusterMode: isInClusterModeRef.current,
        }
      );
      setIsApplyModalVisible(false);
    },
    [dispatch, fileMapRef, kubeConfigContextRef, projectConfigRef, selectedResource, isInClusterModeRef, store]
  );

  const onClickApplyHelmChart = useCallback(
    (namespace?: string, shouldCreateNamespace?: boolean) => {
      if (!selectedHelmValues) {
        setIsHelmChartApplyModalVisible(false);
        return;
      }

      applyHelmChart(
        selectedHelmValues,
        helmChartMapRef.current[selectedHelmValues.helmChartId],
        fileMapRef.current,
        dispatch,
        kubeConfigPathRef.current,
        kubeConfigContextRef.current,
        namespace,
        shouldCreateNamespace
      );
      setIsHelmChartApplyModalVisible(false);
    },
    [dispatch, fileMapRef, helmChartMapRef, kubeConfigPathRef, kubeConfigContextRef, selectedHelmValues]
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
    if (
      activeTabKey === 'form' &&
      (!selectedFilePath || !schemaForSelectedPath) &&
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
  }, [selectedResource, activeTabKey, resourceKindHandler, isKustomization, selectedFilePath, schemaForSelectedPath]);

  useEffect(() => {
    if (tabsList && tabsList.length && extraButton.current) {
      getDistanceBetweenTwoComponents();
    }
  }, [actionsPaneWidth, tabsList, paneConfiguration, selectedResource, getDistanceBetweenTwoComponents]);

  useEffect(() => {
    setSchemaForSelectedPath(selectedFilePath ? getSchemaForPath(selectedFilePath, fileMap) : undefined);
  }, [selectedFilePath, fileMap]);

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
            {isFolderLoading || isPreviewLoading || isClusterModeLoading ? (
              <S.Skeleton active />
            ) : activeTabKey === 'source' ? (
              (selectedResourceRef.current || selectedFilePath || selectedHelmValuesId) && (
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
                  {isFolderLoading || isPreviewLoading || isClusterModeLoading ? (
                    <S.Skeleton active />
                  ) : activeTabKey === 'form' ? (
                    selectedFilePath && schemaForSelectedPath && !selectedResourceRef.current ? (
                      <FormEditor
                        formSchema={extractFormSchema(schemaForSelectedPath)}
                        formUiSchema={getUiSchemaForPath(selectedFilePath)}
                      />
                    ) : isKustomization && selectedResourceRef.current ? (
                      <FormEditor
                        formSchema={extractFormSchema(
                          getResourceSchema(selectedResourceRef.current, String(k8sVersion), String(userDataDir))
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
      ...(selectedResourceId && selectedResourceRef.current?.kind === 'Pod' && isInClusterMode
        ? [
            {
              key: 'logs',
              label: <TabHeader>Logs</TabHeader>,
              children: (
                <>
                  {isFolderLoading || isPreviewLoading || isClusterModeLoading ? (
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
      selectedResourceId,
      activeTabKey,
      applySelection,
      diffSelectedResource,
      isFolderLoading,
      isKustomization,
      isInClusterMode,
      isSchemaAvailable,
      k8sVersion,
      resourceKindHandler,
      schemaForSelectedPath,
      selectedFilePath,
      selectedResourceRef,
      selectedHelmValuesId,
      userDataDir,
      isPreviewLoading,
      isClusterModeLoading,
    ]
  );

  return (
    <S.ActionsPaneMainContainer ref={actionsPaneRef} id="EditorPane" $height={height - 21}>
      <ActionsPaneHeader
        actionsPaneWidth={actionsPaneWidth}
        applySelection={applySelection}
        selectedResourceMeta={selectedResource}
      />

      {selection?.type === 'preview.configuration' ? (
        <PreviewConfigurationDetails />
      ) : selection?.type === 'image' ? (
        <ImageDetails />
      ) : selectedResource || selectedFilePath || selectedHelmValues ? (
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
            ) : selectedFilePath && isHelmChartFile(selectedFilePath) ? (
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
        !hideEditorPlaceholder && (isFolderLoading ? <S.Skeleton active /> : <MonacoPlaceholder />)
      )}

      {isApplyModalVisible && (
        <ModalConfirmWithNamespaceSelect
          isVisible={isApplyModalVisible}
          resourceMetaList={selectedResource ? [selectedResource] : []}
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
