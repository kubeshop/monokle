import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';

import {Dropdown, Tooltip} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {highlightItem, toggleSettings, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import {ClusterSelectionTable} from '@organisms/PageHeader/ClusterSelectionTable';

import * as S from './ClusterSelection.styled';

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const clusterAccess = useAppSelector(state => state.config.projectConfig?.clusterAccess);
  const previewType = useAppSelector(state => state.main.previewType);

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

  const handleLoadCluster = () => {
    if (isClusterActionDisabled && Boolean(previewType === 'cluster' && previewLoader.isLoading)) {
      return;
    }

    if (isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    if (isInClusterMode) {
      reconnectToCluster();
    } else {
      connectToCluster();
    }
  };

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!kubeConfigPath) || !isKubeConfigPathValid);
  }, [kubeConfigPath, isKubeConfigPathValid]);

  const createClusterObjectsLabel = useCallback(() => {
    let content: any;
    let className = '';
    if (isInClusterMode) {
      content = 'Reload';
    } else if (previewType === 'cluster' && previewLoader.isLoading) {
      content = <LoadingOutlined />;
    } else {
      content = 'Load';
      className = highlightedItems.connectToCluster ? 'animated-highlight' : '';
    }

    return (
      <S.ClusterActionText className={className} $highlighted={highlightedItems.connectToCluster}>
        {content}
      </S.ClusterActionText>
    );
  }, [previewType, previewLoader, isInClusterMode, highlightedItems]);

  const {icon, tooltip} = useMemo(() => {
    const hasFullAccess = clusterAccess?.some(ca => ca.hasFullAccess);
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
  }, [clusterAccess]);

  if (!isClusterSelectorVisible) {
    return null;
  }

  return (
    <S.ClusterContainer id="ClusterContainer">
      {activeProject && (
        <S.ClusterStatus>
          {isKubeConfigPathValid && (
            <>
              <S.ClusterOutlined />
              <Dropdown
                overlay={<ClusterSelectionTable setIsClusterDropdownOpen={setIsClusterDropdownOpen} />}
                overlayClassName="cluster-dropdown-item"
                placement="bottomCenter"
                arrow
                trigger={['click']}
                disabled={previewLoader.isLoading || isInClusterMode}
                visible={isClusterDropdownOpen}
                onVisibleChange={setIsClusterDropdownOpen}
              >
                <S.ClusterButton type="link" ref={dropdownButtonRef}>
                  <S.ClusterContextName>{kubeConfigContext}</S.ClusterContextName>
                  <S.DownOutlined />
                </S.ClusterButton>
              </Dropdown>
            </>
          )}
          <S.ClusterStatusText connected={isKubeConfigPathValid}>
            {isKubeConfigPathValid && (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={tooltip}>
                <S.ClusterAccessContainer>{icon}</S.ClusterAccessContainer>
              </Tooltip>
            )}
            <span>{isKubeConfigPathValid ? 'Configured' : 'No Cluster Configured'}</span>
          </S.ClusterStatusText>

          {isKubeConfigPathValid ? (
            <>
              <S.Divider type="vertical" />
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} mouseLeaveDelay={0} title={ClusterModeTooltip} placement="right">
                <S.Button type="link" onClick={handleLoadCluster}>
                  {createClusterObjectsLabel()}
                </S.Button>
              </Tooltip>
            </>
          ) : (
            <>
              <S.ClusterActionButton type="link" onClick={handleClusterConfigure}>
                Configure
              </S.ClusterActionButton>
            </>
          )}
        </S.ClusterStatus>
      )}
    </S.ClusterContainer>
  );
};

export default ClusterSelection;
