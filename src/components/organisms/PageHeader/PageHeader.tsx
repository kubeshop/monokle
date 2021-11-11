import {Badge} from 'antd';
import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateStartupModalVisible} from '@redux/reducers/appConfig';
import {toggleNotifications, toggleSettings} from '@redux/reducers/ui';
import {activeResourcesSelector, isInPreviewModeSelector} from '@redux/selectors';
import {stopPreview} from '@redux/services/preview';

import {HelmChart, HelmValuesFile} from '@models/helm';
import {K8sResource} from '@models/k8sresource';

import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';
import Row from '@components/atoms/Row';

import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  GithubOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';
import MonokleKubeshopLogo from '@assets/MonokleKubeshopLogo.svg';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors, FontColors} from '@styles/Colors';

const StyledLogo = styled.img`
  height: 24px;
  margin: 4px;
  margin-top: 11px;
`;

const LogoCol = styled(Col)`
  padding-left: 4px;
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
`;

const StyledSettingsOutlined = styled(SettingOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

const StyledSettingsBadge = styled(Badge)`
  margin-right: 8px;
  margin-top: 13px;
`;

const StyledNotificationsBadge = styled(Badge)`
  margin-right: 8px;
  margin-top: 13px;
`;

const StyledExclamationCircleOutlined = styled(ExclamationCircleOutlined)`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

const GitHubIconSpan = styled.span`
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
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const [previewValuesFile, setPreviewValuesFile] = useState<HelmValuesFile>();
  const [helmChart, setHelmChart] = useState<HelmChart>();
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(isInPreviewModeSelector);

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
              Previewing {previewResourceId} cluster - {activeResources.length} resources
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
        <Row noborder="true">
          <LogoCol span={12} noborder="true">
            <StyledLogo onClick={showStartupModal} src={MonokleKubeshopLogo} alt="Monokle" />
          </LogoCol>
          <SettingsCol span={12}>
            <GitHubIconSpan>
              <QuestionCircleOutlined size={24} onClick={openDocumentation} />
            </GitHubIconSpan>
            <StyledNotificationsBadge>
              <span onClick={openDiscord}>
                <img src={DiscordLogo} style={{height: '24px', cursor: 'pointer'}} />
              </span>
            </StyledNotificationsBadge>
            <GitHubIconSpan>
              <GithubOutlined size={24} onClick={openGitHub} />
            </GitHubIconSpan>
            <StyledSettingsBadge>
              <StyledSettingsOutlined onClick={toggleSettingsDrawer} />
            </StyledSettingsBadge>
            <StyledNotificationsBadge>
              <StyledExclamationCircleOutlined onClick={toggleNotificationsDrawer} />
            </StyledNotificationsBadge>
          </SettingsCol>
        </Row>
      </StyledHeader>
    </>
  );
};

export default PageHeader;
