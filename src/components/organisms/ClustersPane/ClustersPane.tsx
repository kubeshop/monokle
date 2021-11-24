import * as k8s from '@kubernetes/client-node';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {useDebounce} from 'react-use';

import {Button, Col, Input, Row, Select, Tooltip} from 'antd';

import {WarningOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {BrowseKubeconfigTooltip, ClusterModeTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setCurrentContext, setKubeconfigPathValidity, updateKubeconfig} from '@redux/reducers/appConfig';
import {closeFolderExplorer} from '@redux/reducers/ui';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@redux/selectors';
import {restartPreview, startPreview, stopPreview} from '@redux/services/preview';
import {loadContexts} from '@redux/thunks/loadKubeConfig';

import {MonoPaneTitle, MonoPaneTitleCol, PaneContainer} from '@atoms';

import Colors, {BackgroundColors} from '@styles/Colors';

const StyledDiv = styled.div`
  margin-bottom: 20px;
  margin-top: 10px;

  .ant-input {
    margin-bottom: 15px;
  }
`;

const StyledHeading = styled.h2`
  font-size: 16px;
  margin-bottom: 7px;
`;

const StyledButton = styled(Button)``;

const StyledSelect = styled(Select)`
  width: 100%;
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

  const previewResource = useAppSelector(state => state.main.previewResourceId);
  const isInPreviewMode = useSelector(isInPreviewModeSelector);
  const isInClusterMode = useSelector(isInClusterModeSelector);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const previewType = useAppSelector(state => state.main.previewType);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const kubeconfig = useAppSelector(state => state.config.kubeConfig);
  const isKubeconfigPathValid = useAppSelector(state => state.config.isKubeconfigPathValid);
  const uiState = useAppSelector(state => state.ui);
  const hasUserPerformedClickOnClusterIcon = useAppSelector(state => state.uiCoach.hasUserPerformedClickOnClusterIcon);
  const wasRehydrated = useAppSelector(state => state.main.wasRehydrated);

  const [currentKubeConfig, setCurrentKubeConfig] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);

  const isEditingDisabled = uiState.isClusterDiffVisible || isInClusterMode;
  const isClusterActionDisabled = !kubeconfigPath || !isKubeconfigPathValid;

  useEffect(() => {
    setCurrentKubeConfig(kubeconfigPath);
  }, [kubeconfigPath]);

  useDebounce(
    () => {
      try {
        const kc = new k8s.KubeConfig();

        kc.loadFromFile(currentKubeConfig);

        dispatch(setKubeconfigPathValidity(Boolean(kc.contexts) || false));
      } catch (err) {
        dispatch(setKubeconfigPathValidity(!currentKubeConfig.length));
      } finally {
        dispatch(updateKubeconfig(currentKubeConfig));
      }
    },
    1000,
    [currentKubeConfig, kubeconfigPath]
  );

  const openFileSelect = () => {
    if (isEditingDisabled) {
      return;
    }
    fileInput && fileInput.current?.click();
  };

  const onSelectFile = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isEditingDisabled) {
      return;
    }
    if (fileInput.current?.files && fileInput.current.files.length > 0) {
      const file: any = fileInput.current.files[0];
      if (file.path) {
        const path = file.path;
        dispatch(updateKubeconfig(path));
      }
    }
  };

  const onUpdateKubeconfig = (e: any) => {
    if (isEditingDisabled) {
      return;
    }
    let value = e.target.value;
    setCurrentKubeConfig(value);
  };

  const connectToCluster = () => {
    if (isInPreviewMode && previewResource !== kubeconfigPath) {
      stopPreview(dispatch);
    }
    startPreview(kubeconfigPath, 'cluster', dispatch);
  };

  const reconnectToCluster = () => {
    if (isInPreviewMode && previewResource !== kubeconfigPath) {
      stopPreview(dispatch);
    }
    restartPreview(kubeconfigPath, 'cluster', dispatch);
  };

  const handleContextChange = (context: any) => {
    if (isEditingDisabled) {
      return;
    }
    dispatch(setCurrentContext(context));
  };

  const createClusterObjectsLabel = useCallback(() => {
    if (isInClusterMode) {
      return <span>Reload Cluster Resources</span>;
    }
    if (previewType === 'cluster' && previewLoader.isLoading) {
      return <span>Loading Cluster Resources</span>;
    }
    return <span>Show Cluster Resources</span>;
  }, [previewType, previewLoader, isInClusterMode]);

  useEffect(() => {
    if (uiState.leftMenu.selection === 'cluster-explorer' && uiState.folderExplorer.isOpen) {
      openFileSelect();
      dispatch(closeFolderExplorer());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState]);

  useEffect(() => {
    if (kubeconfigPath) {
      dispatch(loadContexts(kubeconfigPath));
    }
  }, [kubeconfigPath, dispatch]);

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
          <StyledDiv>
            <StyledHeading>
              KUBECONFIG
              {isClusterActionDisabled && hasUserPerformedClickOnClusterIcon && wasRehydrated ? (
                <WarningOutlined
                  style={{color: !isKubeconfigPathValid ? Colors.redError : Colors.yellowWarning, marginLeft: 5}}
                />
              ) : (
                ''
              )}
            </StyledHeading>
            <Input value={currentKubeConfig} onChange={onUpdateKubeconfig} disabled={isEditingDisabled} />
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={BrowseKubeconfigTooltip} placement="right">
              <StyledButton ghost type="primary" onClick={openFileSelect} disabled={isEditingDisabled}>
                Browse
              </StyledButton>
            </Tooltip>
          </StyledDiv>
          <StyledDiv>
            <HiddenInput type="file" onChange={onSelectFile} ref={fileInput} />
            <StyledHeading>Select context to use:</StyledHeading>
            <StyledSelect
              placeholder="Select a context"
              disabled={
                (previewType === 'cluster' && previewLoader.isLoading) || isEditingDisabled || isClusterActionDisabled
              }
              value={kubeconfig.currentContext}
              options={kubeconfig.contexts.map(context => ({label: context.name, value: context.cluster}))}
              onChange={handleContextChange}
            />
          </StyledDiv>
          <StyledDiv>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ClusterModeTooltip} placement="right">
              <StyledButton
                disabled={isClusterActionDisabled}
                type="primary"
                ghost
                loading={previewType === 'cluster' && previewLoader.isLoading}
                onClick={isInClusterMode ? reconnectToCluster : connectToCluster}
              >
                {createClusterObjectsLabel()}
              </StyledButton>
            </Tooltip>
          </StyledDiv>
        </ClustersContainer>
      </PaneContainer>
    </>
  );
};

export default ClustersPane;
