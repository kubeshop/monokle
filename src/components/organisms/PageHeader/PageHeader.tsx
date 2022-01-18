import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, DropDownProps, Dropdown, Menu, Popconfirm, Tooltip} from 'antd';

import {
  BellOutlined,
  CloseCircleOutlined,
  ClusterOutlined,
  DownOutlined,
  FolderOpenOutlined,
  GithubOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {Project} from '@models/appconfig';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';
import {HighlightItems} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setCurrentContext,
  setOpenProject,
  toggleClusterStatus,
  updateProjectConfig,
  updateStartupModalVisible,
} from '@redux/reducers/appConfig';
import {highlightItem, toggleNotifications, toggleSettings} from '@redux/reducers/ui';
import {
  activeProjectSelector,
  activeResourcesSelector,
  isInClusterModeSelector,
  isInPreviewModeSelector,
  kubeConfigContextSelector,
  kubeConfigContextsSelector,
  kubeConfigPathSelector,
  kubeConfigPathValidSelector,
  settingsSelector,
} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';

import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';
import Row from '@components/atoms/Row';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';
import MonokleKubeshopLogo from '@assets/MonokleKubeshopLogo.svg';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors, FontColors} from '@styles/Colors';

import {DiscordTooltip, DocumentationTooltip, GitHubTooltip, NotificationsTooltip, SettingsTooltip} from './tooltips';

const StyledLogo = styled.img`
  height: 24px;
  margin: 4px;
  margin-top: 11px;
`;

const StyledRow = styled(Row)`
  display: flex;
  justify-content: space-between;
  flex-flow: inherit;
`;

const LogoCol = styled(Col)`
  padding-left: 4px;
  flex: 1;
`;

const StyledHeader = styled(Header)`
  width: 100%;
  line-height: 30px;
  background: ${BackgroundColors.darkThemeBackground};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 50px;
  z-index: 1;
  height: 30px;
`;

const SettingsCol = styled(Col)`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
  flex: 1;
`;

const StyledSettingsOutlined = styled(SettingOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

const StyledBellOutlined = styled(BellOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

const IconContainerSpan = styled.span`
  color: ${FontColors.elementSelectTitle};
  padding-top: 10px;
  padding-right: 10px;
  font-size: 24px;
  cursor: pointer;
`;

const PreviewRow = styled(Row)`
  background: ${BackgroundColors.previewModeBackground};
  margin: 0;
  padding: 0 10px;
  height: 25px;
  color: ${Colors.blackPure};
  display: flex;
  justify-content: space-between;
`;

const ClusterRow = styled(Row)`
  background: ${BackgroundColors.clusterModeBackground};
  margin: 0;
  padding: 0 10px;
  height: 25px;
  color: ${Colors.blackPure};
  display: flex;
  justify-content: space-between;
`;

const StyledModeSpan = styled.span`
  font-weight: 500;
`;

const StyledResourceSpan = styled.span`
  font-weight: 700;
`;

const StyledExitButton = styled.span`
  cursor: pointer;
  &:hover {
    font-weight: 500;
  }
`;

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

const StyledDropdown = styled(Dropdown)``;

interface StyledProjectsDropdownProps extends DropDownProps {
  isClusterSelectorVisible: boolean | undefined;
  children: ReactElement;
}

const StyledProjectsDropdown = styled(({children, ...rest}: StyledProjectsDropdownProps) => (
  <Dropdown {...rest}>{children}</Dropdown>
))`
  ${({isClusterSelectorVisible}) => `margin-right: ${isClusterSelectorVisible ? '20px' : '0px'}`};
`;

const StyledCloseCircleOutlined = styled(CloseCircleOutlined)`
  margin-right: 5px;
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

const ExitButton = (props: {onClick: () => void}) => {
  const {onClick} = props;
  return (
    <StyledExitButton onClick={onClick}>
      <StyledCloseCircleOutlined />
      Exit
    </StyledExitButton>
  );
};

const PageHeader = () => {
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const activeResources = useSelector(activeResourcesSelector);
  const currentContext = useAppSelector(state => state.config.kubeConfig.currentContext);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const projects: Project[] = useAppSelector(state => state.config.projects);

  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const isInClusterMode = useSelector(isInClusterModeSelector);

  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const [previewValuesFile, setPreviewValuesFile] = useState<HelmValuesFile>();
  const [helmChart, setHelmChart] = useState<HelmChart>();
  const dispatch = useAppDispatch();
  const activeProject = useSelector(activeProjectSelector);
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const {isClusterSelectorVisible} = useAppSelector(settingsSelector);
  const kubeConfigContext = useAppSelector(kubeConfigContextSelector);
  const kubeConfigContexts = useAppSelector(kubeConfigContextsSelector);
  const kubeConfigPath = useAppSelector(kubeConfigPathSelector);
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);
  const projectConfig = useAppSelector(state => state.config.projectConfig);
  const [isClusterActionDisabled, setIsClusterActionDisabled] = useState(
    Boolean(!kubeConfigPath) || !isKubeConfigPathValid
  );

  useEffect(() => {
    setIsClusterActionDisabled(Boolean(!kubeConfigPath) || !isKubeConfigPathValid);
  }, [kubeConfigPath, isKubeConfigPathValid]);

  useEffect(() => {
    if (previewResourceId) {
      setPreviewResource(resourceMap[previewResourceId]);
    } else {
      setPreviewResource(undefined);
    }

    if (previewValuesFileId && helmValuesMap[previewValuesFileId]) {
      const valuesFile = helmValuesMap[previewValuesFileId];
      setPreviewValuesFile(valuesFile);
      setHelmChart(helmChartMap[valuesFile.helmChartId]);
    } else {
      setPreviewValuesFile(undefined);
      setHelmChart(undefined);
    }
  }, [previewResourceId, previewValuesFileId, helmValuesMap, resourceMap, helmChartMap]);

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const toggleNotificationsDrawer = () => {
    dispatch(toggleNotifications());
  };

  const showStartupModal = () => {
    dispatch(updateStartupModalVisible(true));
  };

  const onClickExit = () => {
    stopPreview(dispatch);
  };

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
    dispatch(toggleClusterStatus());
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

  const createClusterObjectsLabel = useCallback(() => {
    if (isInClusterMode) {
      return <CLusterActionText>RELOAD OBJECTS</CLusterActionText>;
    }
    if (previewType === 'cluster' && previewLoader.isLoading) {
      return <LoadingOutlined />;
    }
    return (
      <CLusterActionText
        className={highlightedItems.connectToCluster ? 'animated-highlight' : ''}
        highlighted={highlightedItems.connectToCluster}
      >
        LOAD OBJECTS
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
    <>
      {isInPreviewMode && previewType === 'kustomization' && (
        <PreviewRow noborder="true">
          <StyledModeSpan>PREVIEW MODE</StyledModeSpan>
          {previewResource && (
            <StyledResourceSpan>
              Previewing [{previewResource.name}] kustomization - {activeResources.length} resources
            </StyledResourceSpan>
          )}
          <ExitButton onClick={onClickExit} />
        </PreviewRow>
      )}
      {isInPreviewMode && previewType === 'cluster' && (
        <ClusterRow>
          <StyledModeSpan>CLUSTER MODE</StyledModeSpan>
          {previewResourceId && (
            <StyledResourceSpan>
              Previewing context [{currentContext}] - {activeResources.length} resources
            </StyledResourceSpan>
          )}
          <ExitButton onClick={onClickExit} />
        </ClusterRow>
      )}
      {isInPreviewMode && previewType === 'helm' && (
        <PreviewRow noborder="true">
          <StyledModeSpan>HELM MODE</StyledModeSpan>
          {previewValuesFileId && (
            <StyledResourceSpan>
              Previewing {previewValuesFile?.name} for {helmChart?.name} Helm chart - {activeResources.length} resources
            </StyledResourceSpan>
          )}
          <ExitButton onClick={onClickExit} />
        </PreviewRow>
      )}
      <StyledHeader noborder="true">
        <StyledRow noborder="true">
          <LogoCol noborder="true">
            <StyledLogo onClick={showStartupModal} src={MonokleKubeshopLogo} alt="Monokle" />
          </LogoCol>
          <CLusterContainer id="ClusterContainer">
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
                          disabled={
                            Boolean(previewType === 'cluster' && previewLoader.isLoading) || isClusterActionDisabled
                          }
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

          <SettingsCol>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DocumentationTooltip} placement="bottomRight">
              <IconContainerSpan>
                <QuestionCircleOutlined size={24} onClick={openDocumentation} />
              </IconContainerSpan>
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DiscordTooltip} placement="bottomRight">
              <IconContainerSpan onClick={openDiscord}>
                <img src={DiscordLogo} style={{height: '24px', cursor: 'pointer', marginBottom: '4px'}} />
              </IconContainerSpan>
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={GitHubTooltip} placement="bottomRight">
              <IconContainerSpan>
                <GithubOutlined size={24} onClick={openGitHub} />
              </IconContainerSpan>
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SettingsTooltip}>
              <IconContainerSpan>
                <StyledSettingsOutlined onClick={toggleSettingsDrawer} />
              </IconContainerSpan>
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
              <IconContainerSpan>
                <StyledBellOutlined onClick={toggleNotificationsDrawer} />
              </IconContainerSpan>
            </Tooltip>
          </SettingsCol>
        </StyledRow>
      </StyledHeader>
    </>
  );
};

export default PageHeader;
