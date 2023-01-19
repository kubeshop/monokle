import {LegacyRef, useEffect, useMemo, useState} from 'react';
import {MonacoDiffEditor} from 'react-monaco-editor';
import {ResizableBox, ResizeHandle} from 'react-resizable';
import {useMeasure} from 'react-use';

import {Button, Select, Skeleton, Switch} from 'antd';

import {ArrowLeftOutlined, ArrowRightOutlined} from '@ant-design/icons';

import {flatten} from 'lodash';
import {stringify} from 'yaml';

import {
  ClusterName,
  makeApplyKustomizationText,
  makeApplyResourceText,
  makeReplaceResourceText,
} from '@constants/makeApplyText';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAlert} from '@redux/reducers/alert';
import {closeResourceDiffModal, openResourceDiffModal} from '@redux/reducers/main';
import {
  currentClusterAccessSelector,
  currentConfigSelector,
  isInClusterModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigPathSelector,
} from '@redux/selectors';
import {isKustomizationResource} from '@redux/services/kustomize';
import {applyResource} from '@redux/thunks/applyResource';
import {updateResource} from '@redux/thunks/updateResource';

import {Icon} from '@atoms';

import {ModalConfirm, ModalConfirmWithNamespaceSelect} from '@components/molecules';

import {useWindowSize} from '@utils/hooks';
import {KUBESHOP_MONACO_THEME} from '@utils/monaco';
import {removeIgnoredPathsFromResourceContent} from '@utils/resources';

import {getResourceKindHandler} from '@src/kindhandlers';

import {AlertEnum, AlertType} from '@shared/models/alert';
import {createKubeClient, hasAccessToResourceKind} from '@shared/utils/kubeclient';
import {kubeConfigContextSelector} from '@shared/utils/selectors';

import * as S from './styled';

enum ModalTypes {
  toCluster = 1,
  toLocal,
}

const DiffModal = () => {
  const dispatch = useAppDispatch();

  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const projectConfig = useAppSelector(currentConfigSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const resourceFilter = useAppSelector(state => state.main.resourceFilter);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const configState = useAppSelector(state => state.config);
  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const namespaces = useMemo(() => clusterAccess?.map(cl => cl.namespace), [clusterAccess]);

  const targetResource = useAppSelector(state =>
    state.main.resourceDiff.targetResourceId
      ? state.main.resourceMap[state.main.resourceDiff.targetResourceId]
      : undefined
  );

  const [containerRef, {height: containerHeight, width: containerWidth}] = useMeasure<HTMLDivElement>();

  const [defaultNamespace, setDefaultNamespace] = useState<string>('');
  const [hasDiffModalLoaded, setHasDiffModalLoaded] = useState(false);
  const [applyModalType, setApplyModalType] = useState<ModalTypes | null>(null);
  const [matchingResourcesById, setMatchingResourcesById] = useState<Record<string, any>>();
  const [matchingResourceText, setMatchingResourceText] = useState<string>();
  const [shouldDiffIgnorePaths, setShouldDiffIgnorePaths] = useState<boolean>(true);
  const [selectedMatchingResourceId, setSelectedMathingResourceId] = useState<string>();
  const [targetResourceText, setTargetResourceText] = useState<string>();

  const windowSize = useWindowSize();

  const isDiffModalVisible = useMemo(
    () => Boolean(targetResource) && !isInClusterMode,
    [isInClusterMode, targetResource]
  );

  const resizableBoxHeight = useMemo(() => windowSize.height * (75 / 100), [windowSize.height]);
  const resizableBoxWidth = useMemo(() => {
    const vwValue = windowSize.width < 1200 ? 95 : 80;
    return windowSize.width * (vwValue / 100);
  }, [windowSize.width]);

  const options = {
    readOnly: true,
    renderSideBySide: true,
    minimap: {
      enabled: false,
    },
  };

  const confirmModalTitle = useMemo(() => {
    if (!targetResource) {
      return '';
    }

    if (applyModalType === ModalTypes.toLocal) {
      return makeReplaceResourceText(targetResource.name, kubeConfigContext, kubeConfigContextColor);
    }

    return isKustomizationResource(targetResource)
      ? makeApplyKustomizationText(targetResource.name, kubeConfigContext, kubeConfigContextColor)
      : makeApplyResourceText(targetResource.name, kubeConfigContext, kubeConfigContextColor);
  }, [targetResource, kubeConfigContext, applyModalType, kubeConfigContextColor]);

  const onClickApplyResource = (namespace?: {name: string; new: boolean}) => {
    if (targetResource?.id) {
      const resource = resourceMap[targetResource.id];
      if (resource) {
        applyResource(resource.id, resourceMap, fileMap, dispatch, projectConfig, kubeConfigContext, namespace, {
          isClusterPreview: previewType === 'cluster',
          shouldPerformDiff: true,
        });
      }
    }
    setApplyModalType(null);
  };

  const handleApply = () => {
    if (targetResource?.id) {
      setApplyModalType(ModalTypes.toCluster);
    }
  };

  const onCloseHandler = () => {
    setHasDiffModalLoaded(false);
    dispatch(closeResourceDiffModal());
  };

  const handleRefresh = () => {
    if (targetResource?.id) {
      dispatch(openResourceDiffModal(targetResource.id));
    }
  };

  const handleReplace = () => {
    if (!targetResource || !shouldDiffIgnorePaths || !cleanMatchingResourceText) {
      return;
    }
    setApplyModalType(ModalTypes.toLocal);
  };

  const onReplaceResource = () => {
    if (!targetResource || !cleanMatchingResourceText) {
      return;
    }
    dispatch(
      updateResource({
        resourceId: targetResource.id,
        text: cleanMatchingResourceText,
        preventSelectionAndHighlightsUpdate: true,
      })
    );
    setApplyModalType(null);
  };

  const cleanMatchingResourceText = useMemo(() => {
    if (
      !isDiffModalVisible ||
      !matchingResourceText ||
      !targetResource?.content ||
      !selectedMatchingResourceId ||
      !matchingResourcesById ||
      !hasDiffModalLoaded
    ) {
      return undefined;
    }

    if (!shouldDiffIgnorePaths) {
      return matchingResourceText;
    }

    const newDiffContentObject = removeIgnoredPathsFromResourceContent(
      matchingResourcesById[selectedMatchingResourceId]
    );
    const cleanDiffContentString = stringify(newDiffContentObject, {sortMapEntries: true});
    return cleanDiffContentString;
  }, [
    isDiffModalVisible,
    matchingResourceText,
    targetResource,
    selectedMatchingResourceId,
    matchingResourcesById,
    hasDiffModalLoaded,
    shouldDiffIgnorePaths,
  ]);

  const areResourcesDifferent = useMemo(() => {
    return targetResourceText !== cleanMatchingResourceText;
  }, [targetResourceText, cleanMatchingResourceText]);

  const onNamespaceSelectHandler = (ns: string) => {
    if (matchingResourcesById) {
      setSelectedMathingResourceId(
        Object.values(matchingResourcesById).find(r => r.metadata.namespace === ns).metadata.uid
      );
    }
  };

  useEffect(() => {
    if (!isDiffModalVisible || !targetResource || !resourceMap) {
      return;
    }

    const getClusterResources = async () => {
      const kc = createKubeClient(kubeConfigPath, kubeConfigContext);

      const resourceKindHandler = getResourceKindHandler(targetResource.kind);
      const getResources = async () => {
        if (!resourceKindHandler) {
          return [];
        }

        if (!clusterAccess || !clusterAccess.length) {
          return resourceKindHandler.listResourcesInCluster(kc, {});
        }

        const namespacesWithAccess = clusterAccess
          .filter(ca => hasAccessToResourceKind(targetResource.kind, 'get', ca))
          .map(ca => ca.namespace);
        const resources = await Promise.all(
          namespacesWithAccess.map(ns => resourceKindHandler.listResourcesInCluster(kc, {namespace: ns}))
        );
        return flatten(resources);
      };

      const resourcesFromCluster = (await getResources()).filter(r => r.metadata.name === targetResource.name);

      // matching resource was not found
      if (!resourcesFromCluster.length) {
        const alert: AlertType = {
          type: AlertEnum.Error,
          title: 'Diff failed',
          message: `Failed to retrieve ${targetResource.content.kind} ${targetResource.content.metadata.name} from cluster [${kubeConfigContext}]`,
        };

        dispatch(setAlert(alert));
        dispatch(closeResourceDiffModal());
        setHasDiffModalLoaded(false);
        return;
      }

      setMatchingResourcesById(
        resourcesFromCluster?.reduce((matchingResources, r) => {
          delete r.metadata?.managedFields;
          if (!r.apiVersion) {
            r.apiVersion = resourceKindHandler?.clusterApiVersion;
          }
          if (!r.kind) {
            r.kind = resourceKindHandler?.kind;
          }
          matchingResources[r.metadata.uid] = r;
          return matchingResources;
        }, {})
      );

      let hasClusterMatchingResource = false;

      // set default selected matching resource
      if (targetResource.namespace) {
        const foundResourceFromCluster = resourcesFromCluster.find(
          r => r.metadata.namespace === targetResource.namespace
        );
        if (foundResourceFromCluster) {
          hasClusterMatchingResource = true;
          setSelectedMathingResourceId(foundResourceFromCluster.metadata.uid);
          setDefaultNamespace(foundResourceFromCluster.metadata.namespace);
          setMatchingResourceText(stringify(foundResourceFromCluster, {sortMapEntries: true}));
        }
      } else if (resourceFilter.namespace) {
        const foundResourceFromCluster = resourcesFromCluster.find(
          r => r.metadata.namespace === resourceFilter.namespace
        );
        if (foundResourceFromCluster) {
          hasClusterMatchingResource = true;
          setSelectedMathingResourceId(foundResourceFromCluster.metadata.uid);
          setDefaultNamespace(foundResourceFromCluster.metadata.namespace);
          setMatchingResourceText(stringify(foundResourceFromCluster, {sortMapEntries: true}));
        }
      }

      if (!hasClusterMatchingResource) {
        setSelectedMathingResourceId(resourcesFromCluster[0].metadata.uid);
        setDefaultNamespace(resourcesFromCluster[0].metadata.namespace);
        setMatchingResourceText(stringify(resourcesFromCluster[0], {sortMapEntries: true}));
      }

      setHasDiffModalLoaded(true);
    };

    setTargetResourceText(stringify(targetResource.content, {sortMapEntries: true}));
    getClusterResources();
  }, [
    kubeConfigContext,
    dispatch,
    resourceMap,
    resourceFilter.namespace,
    targetResource,
    isDiffModalVisible,
    configState,
    namespaces,
    clusterAccess,
    kubeConfigPath,
  ]);

  useEffect(() => {
    if (!isDiffModalVisible) {
      setShouldDiffIgnorePaths(true);
    }
  }, [isDiffModalVisible]);

  return (
    <>
      <S.StyledModal
        title={
          <S.TitleContainer>
            Resource Diff on ${targetResource ? targetResource.name : ''}
            <S.NamespaceSelectContainer>
              <div>
                Namespace:
                <Select
                  value={
                    matchingResourcesById && selectedMatchingResourceId
                      ? matchingResourcesById[selectedMatchingResourceId]?.metadata?.namespace
                      : defaultNamespace
                  }
                  defaultValue={defaultNamespace}
                  onChange={ns => onNamespaceSelectHandler(ns)}
                  style={{width: '300px', marginLeft: '16px'}}
                >
                  {namespaces?.map(ns => (
                    <Select.Option key={ns} value={ns}>
                      {ns}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <S.SwitchContainer onClick={() => setShouldDiffIgnorePaths(!shouldDiffIgnorePaths)}>
                <Switch checked={shouldDiffIgnorePaths} />
                <S.StyledSwitchLabel>Hide ignored fields</S.StyledSwitchLabel>
              </S.SwitchContainer>
            </S.NamespaceSelectContainer>
          </S.TitleContainer>
        }
        open={isDiffModalVisible}
        centered
        width="min-content"
        onCancel={onCloseHandler}
        footer={null}
      >
        <ResizableBox
          width={resizableBoxWidth}
          height={resizableBoxHeight}
          minConstraints={[800, resizableBoxHeight]}
          maxConstraints={[window.innerWidth - 64, resizableBoxHeight]}
          axis="x"
          resizeHandles={['w', 'e']}
          handle={(h: ResizeHandle, ref: LegacyRef<HTMLSpanElement>) => (
            <span className={`custom-modal-handle custom-modal-handle-${h}`} ref={ref} />
          )}
        >
          {!hasDiffModalLoaded ? (
            <div>
              <Skeleton active />
            </div>
          ) : (
            <>
              <S.TagsContainer>
                <S.StyledTag>Local</S.StyledTag>
                <S.StyledTag>
                  Cluster{' '}
                  <ClusterName $kubeConfigContextColor={kubeConfigContextColor}>{kubeConfigContext}</ClusterName>
                </S.StyledTag>
              </S.TagsContainer>
              <S.MonacoDiffContainer width="100%" height="calc(100% - 150px)" ref={containerRef}>
                <MonacoDiffEditor
                  width={containerWidth}
                  height={containerHeight}
                  language="yaml"
                  original={targetResourceText}
                  value={cleanMatchingResourceText}
                  options={options}
                  theme={KUBESHOP_MONACO_THEME}
                />
              </S.MonacoDiffContainer>

              <S.ActionButtonsContainer>
                <Button
                  type="primary"
                  ghost
                  onClick={handleApply}
                  icon={<Icon name="kubernetes" />}
                  disabled={!areResourcesDifferent}
                >
                  Deploy local resource to cluster <ArrowRightOutlined />
                </Button>
                <Button
                  type="primary"
                  ghost
                  onClick={handleReplace}
                  disabled={!shouldDiffIgnorePaths || !areResourcesDifferent}
                >
                  <ArrowLeftOutlined /> Replace local resource with cluster resource
                </Button>
              </S.ActionButtonsContainer>

              <S.ButtonContainer>
                <Button onClick={handleRefresh}>Refresh</Button>
                <Button onClick={onCloseHandler} style={{marginLeft: 12}}>
                  Close
                </Button>
              </S.ButtonContainer>
            </>
          )}
        </ResizableBox>
      </S.StyledModal>

      {applyModalType === ModalTypes.toCluster && (
        <ModalConfirmWithNamespaceSelect
          isVisible={Boolean(applyModalType)}
          resources={targetResource ? [targetResource] : []}
          title={confirmModalTitle}
          onOk={namespace => onClickApplyResource(namespace)}
          onCancel={() => setApplyModalType(null)}
        />
      )}
      {applyModalType === ModalTypes.toLocal && (
        <ModalConfirm
          isVisible={Boolean(applyModalType)}
          text={confirmModalTitle}
          onOk={() => onReplaceResource()}
          onCancel={() => setApplyModalType(null)}
        />
      )}
    </>
  );
};

export default DiffModal;
