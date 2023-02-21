import {useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useWindowSize} from 'react-use';

import {Dropdown, Select, Tooltip} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterNamespaceTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {highlightItem, setActiveSettingsPanel, setLeftMenuSelection, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  currentClusterAccessSelector,
  isInClusterModeSelector,
  isInPreviewModeSelectorNew,
  kubeConfigContextColorSelector,
  kubeConfigPathSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';
import {startClusterConnection, stopClusterConnection} from '@redux/thunks/cluster';

import {ClusterSelectionTable} from '@organisms/PageHeader/ClusterSelectionTable';

import {useTargetClusterNamespaces} from '@hooks/useTargetClusterNamespaces';

import {hotkeys} from '@shared/constants/hotkeys';
import {SettingsPanel} from '@shared/models/config';
import {HighlightItems} from '@shared/models/ui';
import {Size} from '@shared/models/window';
import {defineHotkey} from '@shared/utils/hotkey';
import {activeProjectSelector, kubeConfigContextSelector, kubeConfigPathValidSelector} from '@shared/utils/selectors';

import * as S from './ClusterSelection.styled';

const ClusterSelection = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
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
  const lastNamespaceLoaded = clusterConnectionOptions.lastNamespaceLoaded;
  const isClusterLoading = clusterConnectionOptions.isLoading;
  const preview = useAppSelector(state => state.main.preview);
  const isPreviewLoading = useAppSelector(state => state.main.previewOptions.isLoading);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);

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
    dispatch(setLeftMenuSelection('settings'));

    setImmediate(() => {
      dispatch(
        setActiveSettingsPanel(
          activeProject ? SettingsPanel.CurrentProjectSettings : SettingsPanel.DefaultProjectSettings
        )
      );
    });

    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  const connectToCluster = (namespace?: string) => {
    if (isInPreviewMode) {
      stopPreview(dispatch);
    }

    dispatch(startClusterConnection({context: kubeConfigContext, namespace}));
  };

  const reconnectToCluster = (namespace?: string) => {
    if (isInPreviewMode) {
      stopPreview(dispatch);
    }

    dispatch(startClusterConnection({context: kubeConfigContext, namespace, isRestart: true}));
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
      reconnectToCluster(lastNamespaceLoaded || 'default');
    } else {
      connectToCluster(lastNamespaceLoaded || 'default');
    }
  };

  const onNamespaceChanged = (namespace: any) => {
    reconnectToCluster(namespace as string);
  };

  const onClickExit = () => {
    if (isInPreviewMode) {
      stopPreview(dispatch);
    }
    if (isInClusterMode) {
      dispatch(stopClusterConnection());
    }
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

  const loadOrReload = async () => {
    if (!isInPreviewMode) {
      handleLoadCluster();
      return;
    }

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
      {(activeProject || isInQuickClusterMode) && (
        <>
          {((!isPreviewLoading && isInPreviewMode) || (!isClusterLoading && isInClusterMode)) && size.width > 1350 && (
            <S.PreviewMode
              $isInPreviewMode={isInPreviewMode}
              $isInClusterMode={isInClusterMode}
              $previewType={preview?.type}
              $kubeConfigContextColor={kubeConfigContextColor}
            >
              {isInClusterMode && <span>CLUSTER MODE</span>}
              {preview?.type === 'kustomize' && <span>KUSTOMIZATION PREVIEW</span>}
              {preview?.type === 'helm' && <span>HELM PREVIEW</span>}
              {preview?.type === 'helm-config' && <span>HELM CONFIG PREVIEW</span>}
              {preview?.type === 'command' && <span>COMMAND PREVIEW</span>}
            </S.PreviewMode>
          )}

          <S.ClusterStatus isHalfBordered={!isClusterLoading && isInClusterMode && size.width > 950}>
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
                  disabled={isClusterLoading || isInClusterMode}
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
              $isInClusterMode={!isClusterLoading && isInClusterMode}
              $kubeConfigContextColor={kubeConfigContextColor}
              $previewType={preview?.type}
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
        {isKubeConfigPathValid && (activeProject || isInQuickClusterMode) && (
          <>
            {clusterConnection && (
              <Tooltip placement="left" mouseEnterDelay={TOOLTIP_DELAY} title={ClusterNamespaceTooltip}>
                <S.Select value={clusterConnection.namespace} showSearch onChange={onNamespaceChanged}>
                  <Select.Option key="<all>" value="<all>">{`<all>`}</Select.Option>
                  <Select.Option key="<not-namespaced>" value="<not-namespaced>">
                    {`<not-namespaced>`}
                  </Select.Option>

                  {namespaces.map((ns: string) => (
                    <Select.Option key={ns} value={ns}>
                      {ns}
                    </Select.Option>
                  ))}
                </S.Select>
              </Tooltip>
            )}

            <S.Button
              className={highlightedItems.connectToCluster ? 'animated-highlight' : ''}
              disabled={isPreviewLoading && isClusterLoading && isAccessLoading}
              onClick={loadOrReload}
              $isInClusterMode={isInClusterMode}
              $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
              $previewType={preview?.type}
              loading={isClusterLoading || isPreviewLoading}
              size="small"
              $kubeConfigContextColor={kubeConfigContextColor}
            >
              {isPreviewLoading || isClusterLoading ? '' : isInPreviewMode || isInClusterMode ? 'Reload' : 'Connect'}
            </S.Button>
          </>
        )}

        {((!isPreviewLoading && isInPreviewMode) || (!isClusterLoading && isInClusterMode)) && (
          <S.ExitButton
            onClick={onClickExit}
            $isInPreviewMode={!isPreviewLoading && isInPreviewMode}
            $isInClusterMode={!isClusterLoading && isInClusterMode}
            $previewType={preview?.type}
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
