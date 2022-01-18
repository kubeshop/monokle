import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, DropDownProps, Dropdown, Menu, Popconfirm, Tooltip} from 'antd';

import {ClusterOutlined, DownOutlined, FolderOpenOutlined, LoadingOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {Project} from '@models/appconfig';
import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, setOpenProject, updateProjectConfig} from '@redux/reducers/appConfig';
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

import Colors from '@styles/Colors';

const StyledButton = styled(Button)`
  border-left: 1px solid ${Colors.grey3};
  padding: 0;
  padding-left: 8px;
  margin: 0;
  color: ${Colors.blue6};
  &:hover {
    color: ${Colors.blue6};
    opacity: 0.8;
  }
`;

const StyledClusterButton = styled(Button)`
  border: none;
  outline: none;
  padding: 0px 8px;
`;

const StyledClusterActionButton = styled(Button)`
  border: none;
  outline: none;
  padding: 0px;
  color: ${Colors.blue6};
  font-size: 12px;
`;

const StyledProjectButton = styled(Button)`
  border: none;
  outline: none;
  padding: 0px 8px;
  color: ${Colors.whitePure};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 10px;
  line-height: 20px;
`;

const StyledFolderOpenOutlined = styled(FolderOpenOutlined)`
  color: ${Colors.whitePure};
`;

const CLusterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 4;
`;

const CLusterStatus = styled.div`
  border: 1px solid ${Colors.grey3};
  border-radius: 4px;
  padding: 0px 8px;
`;

const CLusterStatusText = styled.span<{connected: Boolean}>`
  font-size: 10px;
  font-weight: 600;
  border-right: 1px solid ${Colors.grey3};
  padding-right: 8px;
  text-transform: uppercase;
  ${props => `color: ${props.connected ? Colors.greenOkayCompliment : Colors.whitePure}`};
`;

const CLusterActionText = styled(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({className, children, highlighted}: {className?: string; children?: any; highlighted?: boolean}) => (
    <span className={className}>{children}</span>
  )
)`
  font-size: 12px;
  ${({highlighted}) => `
  font-size: ${highlighted ? '8px' : '12px'} !important;
  line-height: ${highlighted ? '32px' : '20px'} !important;
  color: ${highlighted ? Colors.whitePure : Colors.blue6} !important
  `};
`;

const StyledClusterOutlined = styled(ClusterOutlined)`
  font-size: 10px;
  margin-right: 4px;
  letter-spacing: 0.05em;
  font-weight: 600;
  line-height: 20px;
  text-transform: uppercase;
`;

const StyledDropdown = styled(Dropdown)``;

const ClusterSelection = ({previewResource}: {previewResource?: K8sResource}) => {
  const dispatch = useAppDispatch();

  const activeProject = useSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const {isClusterSelectorVisible} = useAppSelector(settingsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const projects: Project[] = useAppSelector(state => state.config.projects);
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

  const handleProjectChange = ({key}: {key: string}) => {
    if (key === 'NEW') {
      dispatch(setOpenProject(null));
      return;
    }
    dispatch(setOpenProject(key));
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

  const projectsMenu = (
    <Menu>
      <Menu.Item key="NEW" onClick={handleProjectChange}>
        --- New Project ---
      </Menu.Item>
      {projects.map((project: Project) => (
        <Menu.Item key={project.rootFolder} onClick={handleProjectChange}>
          {project.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <CLusterContainer>
      {activeProject && (
        <CLusterStatus>
          <StyledProjectsDropdown
            isClusterSelectorVisible={isClusterSelectorVisible}
            overlay={projectsMenu}
            placement="bottomCenter"
            arrow
            trigger={['click']}
          >
            <StyledProjectButton>
              <StyledFolderOpenOutlined />
              <span>{activeProject?.name}</span>
              <DownOutlined style={{margin: 4}} />
            </StyledProjectButton>
          </StyledProjectsDropdown>

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

interface StyledProjectsDropdownProps extends DropDownProps {
  isClusterSelectorVisible: boolean | undefined;
  children: ReactElement;
}

export const StyledProjectsDropdown = styled(({children, ...rest}: StyledProjectsDropdownProps) => (
  <Dropdown {...rest}>{children}</Dropdown>
))`
  ${props => `margin-right: ${props.isClusterSelectorVisible ? '20px' : '0px'}`};
`;
