import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import Colors, {BackgroundColors, FontColors} from '@styles/Colors';
import {
  CloseCircleOutlined,
  GithubOutlined,
  DownloadOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {Badge} from 'antd';
import {AppBorders} from '@styles/Borders';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateStartupModalVisible} from '@redux/reducers/appConfig';
import {toggleSettings} from '@redux/reducers/ui';
import MonokleKubeshopLogo from '@assets/MonokleKubeshopLogo.svg';
import Row from '@components/atoms/Row';
import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';
import {isInPreviewModeSelector, activeResourcesSelector} from '@redux/selectors';
import {useSelector} from 'react-redux';
import {stopPreview} from '@redux/services/preview';

import {K8sResource} from '@models/k8sresource';
import {HelmChart, HelmValuesFile} from '@models/helm';
import {openDocumentation, openGitHub} from '@utils/shell';
import {NewVersionCode} from '@models/appconfig';

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

const StyledDownloadOutlined = styled(DownloadOutlined)`
  color: ${FontColors.afford};
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
  const newVersion = useAppSelector(state => state.config.newVersion);

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
            <GitHubIconSpan>
              <GithubOutlined size={24} onClick={openGitHub} />
            </GitHubIconSpan>
            <StyledSettingsBadge count={newVersion.code > NewVersionCode.Checking ? <StyledDownloadOutlined /> : null}>
              <StyledSettingsOutlined onClick={toggleSettingsDrawer} />
            </StyledSettingsBadge>
          </SettingsCol>
        </Row>
      </StyledHeader>
    </>
  );
};

export default PageHeader;
