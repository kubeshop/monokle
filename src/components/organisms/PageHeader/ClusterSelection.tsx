import {useCallback, useEffect, useRef, useState} from 'react';
import {useHotkeys} from 'react-hotkeys-hook';
import {useSelector} from 'react-redux';

import {Dropdown, Menu, Tooltip} from 'antd';

import {LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, updateProjectConfig} from '@redux/reducers/appConfig';
import {highlightItem, toggleSettings, toggleStartProjectPane} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigContextsSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import * as S from './ClusterSelection.styled';

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isClusterSelectorVisible = useAppSelector(state => state.config.isClusterSelectorVisible);
  const isInClusterMode = useSelector(isInClusterModeSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const projectConfig = useAppSelector(state => state.config.projectConfig);
  const [isClusterDropdownOpen, setIsClusterDropdownOpen] = useState(false);
  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!kubeConfigPath) || !isKubeConfigPathValid
  );
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  useHotkeys('escape', () => {
    setIsClusterDropdownOpen(false);
    dropdownButtonRef.current?.blur();
  });

  const handleClusterChange = ({key}: {key: string}) => {
    setIsClusterDropdownOpen(false);
    dispatch(setCurrentContext(key));
    dispatch(
      updateProjectConfig({
        config: {...projectConfig, kubeConfig: {...projectConfig?.kubeConfig, currentContext: key}},
        fromConfigFile: false,
      })
    );
  };

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
      content = 'RELOAD';
    } else if (previewType === 'cluster' && previewLoader.isLoading) {
      content = <LoadingOutlined />;
    } else {
      content = 'LOAD';
      className = highlightedItems.connectToCluster ? 'animated-highlight' : '';
    }

    return <S.ClusterActionText className={className}>{content}</S.ClusterActionText>;
  }, [previewType, previewLoader, isInClusterMode, highlightedItems]);

  const clusterMenu = (
    <Menu>
      {kubeConfigContexts.map((context: any) => (
        <Menu.Item key={context.name} onClick={handleClusterChange}>
          {context.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  if (!isClusterSelectorVisible) {
    return null;
  }
  return (
    <S.ClusterContainer>
      {activeProject && (
        <S.ClusterStatus>
          <S.ClusterStatusText connected={isKubeConfigPathValid}>
            <S.ClusterOutlined />
            <span>{isKubeConfigPathValid ? 'Configured' : 'No Cluster Configured'}</span>
          </S.ClusterStatusText>

          <S.Divider type="vertical" />

          {isKubeConfigPathValid && (
            <Dropdown
              overlay={clusterMenu}
              overlayClassName="cluster-dropdown-item"
              placement="bottomCenter"
              arrow
              trigger={['click']}
              disabled={previewLoader.isLoading || isInPreviewMode}
              visible={isClusterDropdownOpen}
              onVisibleChange={setIsClusterDropdownOpen}
            >
              <S.ClusterButton type="link" ref={dropdownButtonRef}>
                <S.ClusterContextName>{kubeConfigContext}</S.ClusterContextName>
                <S.DownOutlined />
              </S.ClusterButton>
            </Dropdown>
          )}

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
