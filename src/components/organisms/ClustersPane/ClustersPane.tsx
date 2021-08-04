import React, {useRef} from 'react';
import {Button, Col, Input, Row} from 'antd';
import styled from 'styled-components';
import {useSelector} from 'react-redux';
import {inPreviewMode} from '@redux/selectors';

import {BackgroundColors} from '@styles/Colors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {MonoPaneTitle, MonoPaneTitleCol, PaneContainer} from '@atoms';
import {startPreview, stopPreview} from '@redux/utils/preview';
import {updateKubeconfig} from '@redux/reducers/appConfig';

const StyledDiv = styled.div`
  margin-bottom: 10px;
  margin-top: 10px;
`;

const StyledButton = styled(Button)`
  margin-top: 10px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const TitleRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
`;

const ClustersContainer = styled.div`
  margin: 16px;
`;

const ClustersPane = () => {
  const dispatch = useAppDispatch();
  const previewResource = useAppSelector(state => state.main.previewResource);
  const previewMode = useSelector(inPreviewMode);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const kubeconfig = useAppSelector(state => state.config.kubeconfig);

  const fileInput = useRef<HTMLInputElement>(null);

  const openFileSelect = () => {
    fileInput && fileInput.current?.click();
  };

  const onSelectFile = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (fileInput.current?.files && fileInput.current.files.length > 0) {
      const file: any = fileInput.current.files[0];
      if (file.path) {
        const path = file.path;
        dispatch(updateKubeconfig(path));
      }
    }
  };

  const connectToCluster = () => {
    if (previewMode && previewResource !== kubeconfig) {
      stopPreview(dispatch);
    }
    startPreview(kubeconfig, 'cluster', dispatch);
  };

  return (
    <>
      <TitleRow>
        <MonoPaneTitleCol span={24}>
          <Row>
            <Col span={12}>
              <MonoPaneTitle>Clusters</MonoPaneTitle>
            </Col>
          </Row>
        </MonoPaneTitleCol>
      </TitleRow>
      <PaneContainer>
        <ClustersContainer>
          <StyledDiv>KUBECONFIG</StyledDiv>
          <Input value={kubeconfig} />
          <StyledButton onClick={openFileSelect}>Browse</StyledButton>
          <HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
          <StyledDiv>Select to retrieve resources from configured kubeconfig</StyledDiv>

          <Button
            type="primary"
            ghost
            loading={previewType === 'cluster' && previewLoader.isLoading}
            onClick={connectToCluster}
          >
            Show Cluster Objects
          </Button>
        </ClustersContainer>
      </PaneContainer>
    </>
  );
};

export default ClustersPane;
