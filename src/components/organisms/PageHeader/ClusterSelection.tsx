import {useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useWindowSize} from 'react-use';

import {Dropdown, Tooltip} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import hotkeys from '@constants/hotkeys';

import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';
import {Size} from '@models/window';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {highlightItem, toggleSettings, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  currentClusterAccessSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {ClusterSelectionTable} from '@organisms/PageHeader/ClusterSelectionTable';

import {defineHotkey} from '@utils/defineHotkey';

import * as S from './ClusterSelection.styled';

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const isAccessLoading = useAppSelector(state => state.config.projectConfig?.isAccessLoading);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const clusterAccess = useAppSelector(currentClusterAccessSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const selectedValuesFileId = useAppSelector(state => state.main.selectedValuesFileId);
  const previewConfigurationId = useAppSelector(state => state.main.previewConfigurationId);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const size: Size = useWindowSize();

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
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigPath) {
      stopPreview(dispatch);
    }
    if (kubeConfigPath) {
      startPreview(kubeConfigPath, 'cluster', dispatch);
    }
  };

  const reconnectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeConfigPath) {
      stopPreview(dispatch);
    }
    if (kubeConfigPath) {
      restartPreview(kubeConfigPath, 'cluster', dispatch);
    }
  };

  useHotkeys(defineHotkey(hotkeys.RELOAD_PREVIEW.key), () => {
    reconnectToCluster();
  });

  const handleLoadCluster = () => {
    if (isClusterActionDisabled && Boolean(previewType === 'cluster' && previewLoader.isLoading)) {
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
    if (isAccessLoading) {
      return {
        icon: <LoadingOutlined />,
        tooltip: 'Loading...',
      };
    }

    const hasFullAccess = clusterAccess?.every(ca => ca.hasFullAccess);
    if (hasFullAccess) {
      return {
        icon: <S.CheckCircleOutlined />,
        tooltip: 'You have full access to this cluster',
      };
    }

    return {
      icon: <S.ExclamationCircleOutlinedWarning />,
      tooltip: 'You do not have full access to this cluster',
    };
  }, [clusterAccess, isAccessLoading]);

  const loadOrReloadPreview = () => {
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
  };

  if (!isClusterSelectorVisible) {
    return null;
  }

  return (
    <S.ClusterContainer id="ClusterContainer">
      {activeProject && (
        <>
          {!previewLoader.isLoading && isInPreviewMode && size.width > 1070 && (
            <S.PreviewMode previewType={previewType}>
              {previewType === 'cluster' && <span>CLUSTER MODE</span>}
              {previewType === 'kustomization' && <span>KUSTOMIZATION PREVIEW</span>}
              {previewType === 'helm' && <span>HELM PREVIEW</span>}
              {previewType === 'helm-preview-config' && <span>HELM CONFIG PREVIEW</span>}
            </S.PreviewMode>
          )}

          <S.ClusterStatus isHalfBordered={!previewLoader.isLoading && isInPreviewMode && size.width > 1070}>
            {isKubeConfigPathValid && (
              <>
                {size.width > 810 && (
                  <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltip}>
                    <S.ClusterAccessContainer>{icon}</S.ClusterAccessContainer>
                  </Tooltip>
                )}
                {size.width > 830 && <S.ClusterOutlined />}
                <Dropdown
                  overlay={<ClusterSelectionTable setIsClusterDropdownOpen={setIsClusterDropdownOpen} />}
                  overlayClassName="cluster-dropdown-item"
                  placement="bottom"
                  arrow
                  trigger={['click']}
                  disabled={previewLoader.isLoading || isInPreviewMode}
                  visible={isClusterDropdownOpen}
                  onVisibleChange={setIsClusterDropdownOpen}
                >
                  <S.ClusterButton type="link" ref={dropdownButtonRef} size="small">
                    <S.ClusterContextName>{kubeConfigContext}</S.ClusterContextName>
                    <S.DownOutlined />
                  </S.ClusterButton>
                </Dropdown>
              </>
            )}

            <S.ClusterStatusText
              isKubeConfigPathValid={isKubeConfigPathValid}
              isInPreviewMode={!previewLoader.isLoading && isInPreviewMode}
              previewType={previewType}
            >
              {isKubeConfigPathValid ? (
                <S.CheckCircleOutlined
                  isKubeConfigPathValid={isKubeConfigPathValid}
                  isInPreviewMode={!previewLoader.isLoading && isInPreviewMode}
                  previewType={previewType}
                />
              ) : (
                <S.ClusterOutlined />
              )}
              {(!isInPreviewMode || size.width > 900) && (
                <span>{isKubeConfigPathValid ? 'Configured' : 'NO CLUSTER CONFIGURED'}</span>
              )}
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
        {isKubeConfigPathValid && activeProject && (
          <S.Button
            disabled={isAccessLoading}
            onClick={loadOrReloadPreview}
            isInPreviewMode={!previewLoader.isLoading && isInPreviewMode}
            previewType={previewType}
            loading={previewLoader.isLoading}
            size="small"
          >
            {previewLoader.isLoading ? '' : isInPreviewMode ? 'Reload' : 'Load'}
          </S.Button>
        )}
        {!previewLoader.isLoading && isInPreviewMode && (
          <S.ExitButton
            onClick={onClickExit}
            isInPreviewMode={!previewLoader.isLoading && isInPreviewMode}
            previewType={previewType}
          >
            Exit
          </S.ExitButton>
        )}
      </>
    </S.ClusterContainer>
  );
};

export default ClusterSelection;
