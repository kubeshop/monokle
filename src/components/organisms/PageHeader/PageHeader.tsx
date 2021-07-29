import React, {useState, useEffect} from 'react';
import styled from 'styled-components';

import Colors, {BackgroundColors, FontColors} from '@styles/Colors';
import {CloseCircleOutlined} from '@ant-design/icons';
import {AppBorders} from '@styles/Borders';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {toggleSettings} from '@redux/reducers/ui';
import IconMonokle from '@components/atoms/IconMonokle';
import Row from '@components/atoms/Row';
import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';
import {inPreviewMode, selectActiveResources} from '@redux/selectors';
import {useSelector} from 'react-redux';
import {stopPreview} from '@redux/utils/preview';

import {K8sResource} from '@models/k8sresource';
import {HelmChart, HelmValuesFile} from '@models/helm';

const EditorMode = styled.h4`
  font-size: 2em;
  text-align: right;
  color: ${Colors.yellowWarning};
`;

const StyledHeader = styled(Header)`
  width: 100%;
  line-height: 30px;
  padding-left: 10px;
  background: ${BackgroundColors.darkThemeBackground};
  border-bottom: ${AppBorders.pageDivider};
  min-height: 50px;
  z-index: 1;
  height: 30px;
`;

const SettingsCol = styled(Col)`
  width: 100%;
`;

const StyledSettingsSpan = styled.span`
  float: right;
  color: ${FontColors.elementSelectTitle};
  margin-right: 8px;
  padding: 10px 10px;
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
  const previewResourceId = useAppSelector(state => state.main.previewResource);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFile);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const activeResources = useSelector(selectActiveResources);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const [previewValuesFile, setPreviewValuesFile] = useState<HelmValuesFile>();
  const [helmChart, setHelmChart] = useState<HelmChart>();
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(inPreviewMode);

  useEffect(() => {
    if (previewResourceId) {
      setPreviewResource(resourceMap[previewResourceId]);
    } else {
      setPreviewResource(undefined);
    }

    if (previewValuesFileId && helmValuesMap[previewValuesFileId]) {
      const valuesFile = helmValuesMap[previewValuesFileId];
      setPreviewValuesFile(valuesFile);
      setHelmChart(helmChartMap[valuesFile.helmChart]);
    } else {
      setPreviewValuesFile(undefined);
      setHelmChart(undefined);
    }

  }, [previewResourceId, previewValuesFileId, helmValuesMap, resourceMap, helmValuesMap]);

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const onClickExit = () => {
    stopPreview(dispatch);
  };

  return (
    <>
      {(isInPreviewMode && previewType === 'kustomization') && (
        <PreviewRow noborder>
          <StyledModeSpan>PREVIEW MODE</StyledModeSpan>
          {previewResource && <StyledResourceSpan>Previewing [{previewResource.name}] kustomization
            - {activeResources.length} resources</StyledResourceSpan>}
          <ExitButton onClick={onClickExit} />
        </PreviewRow>
      )}
      {isInPreviewMode && previewType === 'cluster' && (
        <ClusterRow>
          <StyledModeSpan>CLUSTER MODE</StyledModeSpan>
          {previewResourceId && <StyledResourceSpan>Previewing {previewResourceId} cluster
            - {activeResources.length} resources</StyledResourceSpan>}
          <ExitButton onClick={onClickExit} />
        </ClusterRow>
      )}
      {isInPreviewMode && previewType === 'helm' && (
        <PreviewRow noborder>
          <StyledModeSpan>HELM MODE</StyledModeSpan>
          {previewValuesFileId &&
          <StyledResourceSpan>Previewing {previewValuesFile?.name} for {helmChart?.name} Helm chart
            - {activeResources.length} resources</StyledResourceSpan>}
          <ExitButton onClick={onClickExit} />
        </PreviewRow>
      )}
      <StyledHeader noborder>
        <Row noborder>
          <Col span={12} noborder>
            <IconMonokle useDarkTheme />
          </Col>
          <SettingsCol span={12}>
            <StyledSettingsSpan onClick={toggleSettingsDrawer}>Settings</StyledSettingsSpan>
          </SettingsCol>
        </Row>
      </StyledHeader>
    </>
  );
};

export default PageHeader;
