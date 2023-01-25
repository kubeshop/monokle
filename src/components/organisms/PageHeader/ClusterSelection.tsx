import {useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useWindowSize} from 'react-use';

import {Dropdown, Select, Tooltip} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterNamespaceTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setClusterPreviewNamespace} from '@redux/reducers/appConfig';
import {highlightItem, toggleSettings, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  currentClusterAccessSelector,
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  kubeConfigContextColorSelector,
  kubeConfigPathSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {ClusterSelectionTable} from '@organisms/PageHeader/ClusterSelectionTable';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {hotkeys} from '@shared/constants/hotkeys';
import {K8sResource} from '@shared/models/k8sResource';
import {HighlightItems} from '@shared/models/ui';
import {Size} from '@shared/models/window';
import {defineHotkey} from '@shared/utils/hotkey';
import {activeProjectSelector, kubeConfigContextSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

import * as S from './ClusterSelection.styled';

// TODO: we have to revisit the commented code in this component
const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const clusterPreviewNamespace = useAppSelector(state => state.config.clusterPreviewNamespace);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const isAccessLoading = useAppSelector(state => state.config?.isAccessLoading);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const clusterConnection = useAppSelector(state => state.main.clusterConnection);
  const clusterConnectionOptions = useAppSelector(state => state.main.clusterConnectionOptions);
  const selection = useAppSelector(state => state.main.selection);
  const preview = useAppSelector(state => state.main.preview);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);

  const size: Size = useWindowSize();

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
    // TODO: revisit this after refactoring cluster connnection
    // startPreview(kubeConfigContext, 'cluster', dispatch);
  };

  const reconnectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigContext) {
      stopPreview(dispatch);
    }
    // TODO: revisit this after refactoring cluster connnection
    // restartPreview(kubeConfigContext, 'cluster', dispatch);
  };

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reconnectToCluster();
  });

  const handleLoadCluster = () => {
    if (isClusterActionDisabled && Boolean(clusterConnectionOptions.isLoading)) {
      return;
    }

    if (isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    if (clusterConnection) {
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
            $isInPreviewMode={!clusterConnectionOptions.isLoading && isInClusterMode}
            $isInClusterMode={isInClusterMode}
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
  }, [clusterAccess, isAccessLoading, isKubeConfigPathValid, clusterConnectionOptions.isLoading, isInClusterMode]);

  const loadOrReloadPreview = async () => {
    if (!isInPreviewMode) {
      handleLoadCluster();
      return;
    }

    // TODO: revisit this after refactoring cluster connnection
    // if (previewType === 'cluster') {
    //   handleLoadCluster();
    // }
    if (preview?.type === 'helm') {
      restartPreview(preview, dispatch);
    }
    if (preview?.type === 'kustomize') {
      restartPreview(preview, dispatch);
    }
    if (preview?.type === 'helm-config') {
      startPreview(preview, dispatch);
    }
    if (preview?.type === 'command') {
      startPreview(preview, dispatch);
    }
  };

  if (!isClusterSelectorVisible) {
    return null;
  }

  return (
    <S.ClusterContainer id="ClusterContainer">
      {(activeProject || isInClusterMode) && (
        <>
          {/*
           // TODO: revisit this
            {!isPreviewLoading && isInPreviewMode && size.width > 1350 && (
            <S.PreviewMode
              $isInPreviewMode={isInPreviewMode}
              $isInClusterMode={isInClusterMode}
              $previewType={previewType}
              $kubeConfigContextColor={kubeConfigContextColor}
            >
              {previewType === 'cluster' && <span>CLUSTER MODE</span>}
              {previewType === 'kustomization' && <span>KUSTOMIZATION PREVIEW</span>}
              {previewType === 'helm' && <span>HELM PREVIEW</span>}
              {previewType === 'helm-preview-config' && <span>HELM CONFIG PREVIEW</span>}
              {previewType === 'command' && <span>COMMAND PREVIEW</span>}
            </S.PreviewMode>
          )} */}

          <S.ClusterStatus isHalfBordered={!isPreviewLoading && isInPreviewMode && size.width > 950}>
            {isKubeConfigPathValid && (
              <>
                <S.ClusterOutlined />
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'form',
                        label: <ClusterSelectionTable setIsClusterDropdownOpen={setIsClusterDropdownOpen} />,
                      },
                    ],
                  }}
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
              // $previewType={previewType}
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
        {isKubeConfigPathValid && (activeProject || isInClusterMode) && (
          <>
            {isInClusterMode && (
              <Tooltip placement="left" mouseEnterDelay={TOOLTIP_DELAY} title={ClusterNamespaceTooltip}>
                <S.Select
                  value={clusterPreviewNamespace}
                  showSearch
                  onChange={namespace => {
                    dispatch(setClusterPreviewNamespace(namespace as string));
                    // TODO: revisit this after refactoring cluster connnection
                    // restartPreview(kubeConfigContext, 'cluster', dispatch);
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
              </Tooltip>
            )}

            <S.Button
              className={highlightedItems.connectToCluster ? 'animated-highlight' : ''}
              disabled={isPreviewLoading && isAccessLoading}
              onClick={loadOrReloadPreview}
              $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
              // $previewType={previewType}
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
            // $previewType={previewType}
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
