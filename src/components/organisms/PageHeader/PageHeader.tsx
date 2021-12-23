import React, {useCallback, useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {Button, Dropdown, Menu, Popconfirm, Tooltip} from 'antd';

import {
  BellOutlined,
  CloseCircleOutlined,
  ClusterOutlined,
  DownOutlined,
  GithubOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ClusterModeTooltip} from '@constants/tooltips';

import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, updateStartupModalVisible} from '@redux/reducers/appConfig';
import {
  setClusterIconHighlightStatus,
  toggleClusterStatus,
  toggleNotifications,
  toggleSettings,
} from '@redux/reducers/ui';
import {activeResourcesSelector, isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';
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

const StyledCloseCircleOutlined = styled(CloseCircleOutlined)`
  margin-right: 5px;
`;

const StyledDot = styled.div`
  background-color: black;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  margin: 0 5px;
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
  ${props => `color: ${props.connected ? Colors.greenOkayCompliment : Colors.whitePure}`}
`;

const CLusterActionText = styled.span`
  font-size: 11px;
  font-weight: 600;
`;

const StyledClusterOutlined = styled(ClusterOutlined)`
  font-size: 12px;
  margin-right: 4px;
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
  const isKubeconfigPathValid = useAppSelector(state => state.config.isKubeconfigPathValid);
  const kubeConfig = useAppSelector(state => state.config.kubeConfig);
  const clusterStatusHidden = useAppSelector(state => state.ui.clusterStatusHidden);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);

  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const isInClusterMode = useSelector(isInClusterModeSelector);
  const isClusterActionDisabled = !kubeconfigPath || !isKubeconfigPathValid;

  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const [previewValuesFile, setPreviewValuesFile] = useState<HelmValuesFile>();
  const [helmChart, setHelmChart] = useState<HelmChart>();
  const dispatch = useAppDispatch();

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

  const handleClusterChange = ({key}: any) => dispatch(setCurrentContext(key));

  const handleClusterConfigure = () => {
    dispatch(setClusterIconHighlightStatus(true));
    dispatch(toggleSettings());
    setTimeout(() => {
      dispatch(setClusterIconHighlightStatus(false));
    }, 3000);
  };

  const handleClusterHideClick = () => {
    dispatch(setClusterIconHighlightStatus(true));
  };

  const handleClusterHideConfirm = () => {
    dispatch(setClusterIconHighlightStatus(false));
    dispatch(toggleClusterStatus());
  };

  const handleClusterHideCancel = () => {
    dispatch(setClusterIconHighlightStatus(false));
  };

  const connectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeconfigPath) {
      stopPreview(dispatch);
    }
    startPreview(kubeconfigPath, 'cluster', dispatch);
  };

  const reconnectToCluster = () => {
    if (isInPreviewMode && previewResource && previewResource.id !== kubeconfigPath) {
      stopPreview(dispatch);
    }
    restartPreview(kubeconfigPath, 'cluster', dispatch);
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
      return <CLusterActionText>RELOAD</CLusterActionText>;
    }
    if (previewType === 'cluster' && previewLoader.isLoading) {
      return <LoadingOutlined />;
    }
    return <CLusterActionText>LOAD</CLusterActionText>;
  }, [previewType, previewLoader, isInClusterMode]);

  const clusterMenu = (
    <Menu>
      {kubeConfig.contexts.map((context: any) => (
        <Menu.Item key={context.cluster} onClick={handleClusterChange}>
          {context.cluster}
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
          {!clusterStatusHidden && (
            <CLusterContainer>
              <CLusterStatus>
                <CLusterStatusText connected={isKubeconfigPathValid}>
                  <StyledClusterOutlined />
                  {isKubeconfigPathValid && <span>CONNECTED</span>}
                  {!isKubeconfigPathValid && <span>NO CLUSTER CONFIGURED</span>}
                </CLusterStatusText>
                {isKubeconfigPathValid && (
                  <StyledDropdown
                    overlay={clusterMenu}
                    placement="bottomCenter"
                    arrow
                    trigger={['click']}
                    disabled={previewLoader.isLoading || isInPreviewMode}
                  >
                    <StyledClusterButton>
                      <span>{kubeConfig.currentContext}</span>
                      <DownOutlined style={{margin: 4}} />
                    </StyledClusterButton>
                  </StyledDropdown>
                )}
                {isKubeconfigPathValid ? (
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
              </CLusterStatus>
            </CLusterContainer>
          )}

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
