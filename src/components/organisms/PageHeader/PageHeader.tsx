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
import {inPreviewMode} from '@redux/selectors';
import {useSelector} from 'react-redux';
import {clearPreview} from '@redux/reducers/main';

import {K8sResource} from '@models/k8sresource';

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
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewType = useAppSelector(state => state.main.previewType);
  const [previewResource, setPreviewResource] = useState<K8sResource>();
  const dispatch = useAppDispatch();
  const isInPreviewMode = useSelector(inPreviewMode);

  useEffect(() => {
    if (previewResourceId) {
      setPreviewResource(resourceMap[previewResourceId]);
    } else {
      setPreviewResource(undefined);
    }
  }, [previewResourceId, resourceMap]);

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const onClickExit = () => {
    dispatch(clearPreview());
  };

  return (
    <>
      {((isInPreviewMode && previewType === 'kustomization') || previewType === 'helm') && (
        <PreviewRow noborder>
          <StyledModeSpan>PREVIEW MODE</StyledModeSpan>
          {previewResource && <StyledResourceSpan>{previewResource.name}</StyledResourceSpan>}
          <ExitButton onClick={onClickExit} />
        </PreviewRow>
      )}
      {isInPreviewMode && previewType === 'cluster' && (
        <ClusterRow>
          <StyledModeSpan>CLUSTER MODE</StyledModeSpan>
          {previewResourceId && <StyledResourceSpan>{previewResourceId}</StyledResourceSpan>}
          <ExitButton onClick={onClickExit} />
        </ClusterRow>
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
