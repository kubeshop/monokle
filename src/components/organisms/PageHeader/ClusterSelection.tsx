import {useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useWindowSize} from 'react-use';

import {Dropdown, Select, Tooltip} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';

import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';
import {Size} from '@models/window';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setClusterPreviewNamespace} from '@redux/reducers/appConfig';
import {highlightItem, toggleSettings, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  currentClusterAccessSelector,
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextColorSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {ClusterSelectionTable} from '@organisms/PageHeader/ClusterSelectionTable';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {defineHotkey} from '@utils/defineHotkey';
import {sleep} from '@utils/sleep';

import * as S from './ClusterSelection.styled';

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const clusterPreviewNamepsace = useAppSelector(state => state.config.clusterPreviewNamespace);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const isAccessLoading = useAppSelector(state => state.config?.isAccessLoading);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const previewingCluster = useAppSelector(state => state.ui.previewingCluster);
  const previewConfigurationId = useAppSelector(state => state.main.previewConfigurationId);
  const previewCommandId = useAppSelector(state => state.main.previewCommandId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const size: Size = useWindowSize();
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [namespaces] = useTargetClusterNamespaces();

  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!kubeConfigPath) || !isKubeConfigPathValid
  );
  const [isClusterDropdownOpen, setIsClusterDropdownOpen] = useState(false);

  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  useHotkeys('escape', () => {
    setIsClusterDropdownOpen(false);
    dropdownButtonRef.current?.blur();
  });

  const handleClusterConfigure = () => {
    dispatch(highlightItem(HighlightItems.CLUSTER_PANE_ICON));
    dispatch(toggleSettings());
    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  const connectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigContext) {
      stopPreview(dispatch);
    }
    startPreview(kubeConfigContext, 'cluster', dispatch);
  };

  const reconnectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigContext) {
      stopPreview(dispatch);
    }
    restartPreview(kubeConfigContext, 'cluster', dispatch);
  };

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reconnectToCluster();
  });

  const handleLoadCluster = () => {
    if (isClusterActionDisabled && Boolean(previewType === 'cluster' && isPreviewLoading)) {
      return;
    }

    if (isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    if (isInPreviewMode && previewType === 'cluster') {
      reconnectToCluster();
    } else {
      connectToCluster();
    }
  };

  const onClickExit = () => {
    stopPreview(dispatch);
  };

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!kubeConfigPath) || !isKubeConfigPathValid);
  }, [kubeConfigPath, isKubeConfigPathValid]);

  const {icon, tooltip} = useMemo(() => {
    if (!isKubeConfigPathValid) {
      return {
        icon: <S.ClusterOutlined />,
        tooltip: '',
      };
    }

    if (isAccessLoading) {
      return {
        icon: <LoadingOutlined />,
        tooltip: 'Loading...',
      };
    }

    const hasFullAccess = clusterAccess?.every(ca => ca.hasFullAccess);
    if (hasFullAccess) {
      return {
        icon: (
          <S.CheckCircleOutlined
            $isKubeConfigPathValid={isKubeConfigPathValid}
            $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
            $previewType={previewType}
            $kubeConfigContextColor={kubeConfigContextColor}
          />
        ),
        tooltip: 'Configured with full access.',
      };
    }

    return {
      icon: <S.ExclamationCircleOutlinedWarning />,
      tooltip: 'Configured with restricted access.',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterAccess, isAccessLoading, isKubeConfigPathValid, isPreviewLoading, isInPreviewMode]);

  useEffect(() => {
    if (!(isPreviewLoading && previewLoader.isLoading)) {
      setIsPreviewLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewLoader.isLoading]);

  const loadOrReloadPreview = async () => {
    setIsPreviewLoading(true);
    await sleep(500);

    if (!isInPreviewMode) {
      handleLoadCluster();
      return;
    }

    if (previewType === 'cluster') {
      handleLoadCluster();
    }
    if (previewType === 'helm' && selectedValuesFileId) {
      restartPreview(selectedValuesFileId, 'helm', dispatch);
    }
    if (previewType === 'kustomization' && previewResourceId) {
      restartPreview(previewResourceId, 'kustomization', dispatch);
    }
    if (previewType === 'helm-preview-config' && previewConfigurationId) {
      startPreview(previewConfigurationId, 'helm-preview-config', dispatch);
    }
    if (previewType === 'command' && previewCommandId) {
      startPreview(previewCommandId, 'command', dispatch);
    }
  };

  if (!isClusterSelectorVisible) {
    return null;
  }

  return (
    <S.ClusterContainer id="ClusterContainer">
      {(activeProject || previewingCluster) && (
        <>
          {!isPreviewLoading && isInPreviewMode && size.width > 1350 && (
            <S.PreviewMode
              $isInPreviewMode={isInPreviewMode}
              $previewType={previewType}
              $kubeConfigContextColor={kubeConfigContextColor}
            >
              {previewType === 'cluster' && <span>CLUSTER MODE</span>}
              {previewType === 'kustomization' && <span>KUSTOMIZATION PREVIEW</span>}
              {previewType === 'helm' && <span>HELM PREVIEW</span>}
              {previewType === 'helm-preview-config' && <span>HELM CONFIG PREVIEW</span>}
              {previewType === 'command' && <span>COMMAND PREVIEW</span>}
            </S.PreviewMode>
          )}

          <S.ClusterStatus isHalfBordered={!isPreviewLoading && isInPreviewMode && size.width > 950}>
            {isKubeConfigPathValid && (
              <>
                <S.ClusterOutlined />
                <Dropdown
                  overlay={<ClusterSelectionTable setIsClusterDropdownOpen={setIsClusterDropdownOpen} />}
                  overlayClassName="cluster-dropdown-item"
                  placement="bottomLeft"
                  arrow
                  trigger={['click']}
                  disabled={isPreviewLoading || isInPreviewMode}
                  open={isClusterDropdownOpen}
                  onOpenChange={setIsClusterDropdownOpen}
                >
                  <S.ClusterButton type="link" ref={dropdownButtonRef} size="small">
                    <S.ClusterContextName>{kubeConfigContext}</S.ClusterContextName>
                    <S.DownOutlined />
                  </S.ClusterButton>
                </Dropdown>
              </>
            )}

            <S.ClusterStatusText
              $isKubeConfigPathValid={isKubeConfigPathValid}
              $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
              $kubeConfigContextColor={kubeConfigContextColor}
              $previewType={previewType}
            >
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltip}>
                <S.ClusterAccessContainer>{icon}</S.ClusterAccessContainer>
              </Tooltip>
              {!isKubeConfigPathValid && <span>NO CLUSTER CONFIGURED</span>}
            </S.ClusterStatusText>

            {!isKubeConfigPathValid && (
              <S.ClusterActionButton type="link" onClick={handleClusterConfigure}>
                Configure
              </S.ClusterActionButton>
            )}
          </S.ClusterStatus>
        </>
      )}

      <>
        {isKubeConfigPathValid && (activeProject || previewingCluster) && (
          <>
            {isInClusterMode && (
              <S.Select
                value={clusterPreviewNamepsace}
                showSearch
                onChange={namespace => {
                  dispatch(setClusterPreviewNamespace(namespace as string));
                  restartPreview(kubeConfigContext, 'cluster', dispatch);
                }}
              >
                <Select.Option key="<all>" value="<all>">{`<all>`}</Select.Option>
                <Select.Option key="<not-namespaced>" value="<not-namespaced>">
                  {`<not-namespaced>`}
                </Select.Option>

                {namespaces.map(ns => (
                  <Select.Option key={ns} value={ns}>
                    {ns}
                  </Select.Option>
                ))}
              </S.Select>
            )}

            <S.Button
              className={highlightedItems.connectToCluster ? 'animated-highlight' : ''}
              disabled={isPreviewLoading && isAccessLoading}
              onClick={loadOrReloadPreview}
              $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
              $previewType={previewType}
              loading={isPreviewLoading}
              size="small"
              $kubeConfigContextColor={kubeConfigContextColor}
            >
              {isPreviewLoading ? '' : isInPreviewMode ? 'Reload' : 'Load'}
            </S.Button>
          </>
        )}

        {!isPreviewLoading && isInPreviewMode && (
          <S.ExitButton
            onClick={onClickExit}
            $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
            $previewType={previewType}
            $kubeConfigContextColor={kubeConfigContextColor}
          >
            Exit
          </S.ExitButton>
        )}
      </>
    </S.ClusterContainer>
  );
};

export default ClusterSelection;
