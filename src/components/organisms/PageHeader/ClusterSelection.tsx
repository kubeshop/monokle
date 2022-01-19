import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Menu, Popconfirm, Tooltip} from 'antd';

import {DownOutlined, LoadingOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, updateProjectConfig} from '@redux/reducers/appConfig';
import {highlightItem, toggleSettings} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigContextsSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
  settingsSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import ProjectSelection from './ProjectSelection';
import {
  CLusterActionText,
  CLusterContainer,
  CLusterStatus,
  CLusterStatusText,
  StyledButton,
  StyledClusterActionButton,
  StyledClusterButton,
  StyledClusterOutlined,
  StyledDropdown,
} from './Styled';

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();

  const activeProject = useSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const {isClusterSelectorVisible} = useAppSelector(settingsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const isInClusterMode = useSelector(isInClusterModeSelector);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const projectConfig = useAppSelector(state => state.config.projectConfig);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!kubeConfigPath) || !isKubeConfigPathValid
  );

  const handleClusterChange = ({key}: {key: string}) => {
    dispatch(setCurrentContext(key));
    dispatch(updateProjectConfig({...projectConfig, kubeConfig: {...projectConfig?.kubeConfig, currentContext: key}}));
  };

  const handleClusterConfigure = () => {
    dispatch(highlightItem(HighlightItems.CLUSTER_PANE_ICON));
    dispatch(toggleSettings());
    setTimeout(() => {
      dispatch(highlightItem(null));
    }, 3000);
  };

  const handleClusterHideClick = () => {
    dispatch(highlightItem(HighlightItems.CLUSTER_PANE_ICON));
  };

  const handleClusterHideConfirm = () => {
    dispatch(highlightItem(null));
    dispatch(
      updateProjectConfig({
        ...projectConfig,
        settings: {
          ...projectConfig?.settings,
          isClusterSelectorVisible: false,
        },
      })
    );
  };

  const handleClusterHideCancel = () => {
    dispatch(highlightItem(null));
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
    if (isInClusterMode) {
      return <CLusterActionText>RELOAD</CLusterActionText>;
    }
    if (previewType === 'cluster' && previewLoader.isLoading) {
      return <LoadingOutlined />;
    }
    return (
      <CLusterActionText
        className={highlightedItems.connectToCluster ? 'animated-highlight' : ''}
        highlighted={highlightedItems.connectToCluster}
      >
        LOAD
      </CLusterActionText>
    );
  }, [previewType, previewLoader, isInClusterMode, highlightedItems]);

  const clusterMenu = (
    <Menu>
      {kubeConfigContexts.map((context: any) => (
        <Menu.Item key={context.cluster} onClick={handleClusterChange}>
          {context.cluster}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <CLusterContainer>
      {activeProject && (
        <CLusterStatus>
          <ProjectSelection />
          {isClusterSelectorVisible && (
            <>
              <CLusterStatusText connected={isKubeConfigPathValid}>
                <StyledClusterOutlined />
                {isKubeConfigPathValid && <span>Configured</span>}
                {!isKubeConfigPathValid && <span>No Cluster Configured</span>}
              </CLusterStatusText>
              {isKubeConfigPathValid && (
                <StyledDropdown
                  overlay={clusterMenu}
                  placement="bottomCenter"
                  arrow
                  trigger={['click']}
                  disabled={previewLoader.isLoading || isInPreviewMode}
                >
                  <StyledClusterButton>
                    <span>{kubeConfigContext}</span>
                    <DownOutlined style={{margin: 4}} />
                  </StyledClusterButton>
                </StyledDropdown>
              )}
              {isKubeConfigPathValid ? (
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ClusterModeTooltip} placement="right">
                  <StyledButton
                    disabled={Boolean(previewType === 'cluster' && previewLoader.isLoading) || isClusterActionDisabled}
                    type="link"
                    onClick={handleLoadCluster}
                  >
                    {createClusterObjectsLabel()}
                  </StyledButton>
                </Tooltip>
              ) : (
                <>
                  <StyledClusterActionButton style={{marginRight: 8}} onClick={handleClusterConfigure}>
                    Configure
                  </StyledClusterActionButton>
                  <Popconfirm
                    placement="bottom"
                    title={() => (
                      <>
                        <p>If you want to configure later, use the cluster icon in the left rail.</p>
                        <p style={{margin: 0}}>You can re-enable the Cluster Selector in the Settings Panel</p>
                      </>
                    )}
                    okText="Ok, hide"
                    cancelText="Nevermind"
                    onConfirm={handleClusterHideConfirm}
                    onCancel={handleClusterHideCancel}
                  >
                    <StyledClusterActionButton onClick={handleClusterHideClick}>Hide</StyledClusterActionButton>
                  </Popconfirm>
                </>
              )}
            </>
          )}
        </CLusterStatus>
      )}
    </CLusterContainer>
  );
};

export default ClusterSelection;
