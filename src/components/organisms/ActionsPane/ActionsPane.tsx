import React, {useCallback, useEffect, useState} from 'react';
import {Tabs, Col, Row, Button, Skeleton, Modal, Tooltip} from 'antd';
import styled from 'styled-components';
import {
  CodeOutlined,
  ContainerOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {applyResource} from '@redux/thunks/applyResource';
import TabHeader from '@atoms/TabHeader';
import {PaneContainer, MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import {K8sResource} from '@models/k8sresource';
import {isKustomizationResource} from '@redux/services/kustomize';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {ThunkDispatch} from 'redux-thunk';
import {ApplyFileTooltip, ApplyTooltip, DiffTooltip} from '@constants/tooltips';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {selectFromHistory} from '@redux/thunks/selectionHistory';
import {TOOLTIP_DELAY} from '@constants/constants';
import {applyFile} from '@redux/thunks/applyFile';

const {TabPane} = Tabs;

const StyledTabs = styled(Tabs)`
  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 0px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }
`;

const ActionsPaneContainer = styled(PaneContainer)`
  height: 100%;
  overflow-y: hidden;
`;

const TitleBarContainer = styled.div`
  display: flex;
  height: 24px;
  justify-content: space-between;
`;

const RightButtons = styled.div`
  float: right;
  display: flex;
`;

const DiffButton = styled(Button)`
  margin-left: 8px;
  margin-right: 4px;
`;

const StyledSkeleton = styled(Skeleton)`
  margin: 20px;
  padding: 8px;
  width: 95%;
`;

const StyledLeftArrowButton = styled(Button)`
  margin-right: 5px;
`;

const StyledRightArrowButton = styled(Button)`
  margin-right: 10px;
`;

export function applyWithConfirm(
  selectedResource: K8sResource,
  resourceMap: ResourceMapType,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string
) {
  const title = isKustomizationResource(selectedResource)
    ? `Apply ${selectedResource.name} kustomization your cluster?`
    : `Apply ${selectedResource.name} to your cluster?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        applyResource(selectedResource.id, resourceMap, fileMap, dispatch, kubeconfig);
        resolve({});
      });
    },
    onCancel() {},
  });
}

function applyFileWithConfirm(
  selectedPath: string,
  fileMap: FileMapType,
  dispatch: ThunkDispatch<any, any, any>,
  kubeconfig: string
) {
  const title = `Apply ${fileMap[selectedPath].name} to your cluster?`;

  Modal.confirm({
    title,
    icon: <ExclamationCircleOutlined />,
    onOk() {
      return new Promise(resolve => {
        applyFile(selectedPath, fileMap, dispatch, kubeconfig);
        resolve({});
      });
    },
    onCancel() {},
  });
}

const ActionsPane = (props: {contentHeight: string}) => {
  const {contentHeight} = props;

  const selectedResourceId = useAppSelector(state => state.main.selectedResourceId);
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedPath = useAppSelector(state => state.main.selectedPath);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const kubeconfig = useAppSelector(state => state.config.kubeconfigPath);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const currentSelectionHistoryIndex = useAppSelector(state => state.main.currentSelectionHistoryIndex);
  const selectionHistory = useAppSelector(state => state.main.selectionHistory);
  const [key, setKey] = useState('source');
  const dispatch = useAppDispatch();

  const isLeftArrowEnabled =
    selectionHistory.length > 1 &&
    (currentSelectionHistoryIndex === undefined || (currentSelectionHistoryIndex && currentSelectionHistoryIndex > 0));
  const isRightArrowEnabled =
    selectionHistory.length > 1 &&
    currentSelectionHistoryIndex !== undefined &&
    currentSelectionHistoryIndex < selectionHistory.length - 1;

  const onClickLeftArrow = () => {
    dispatch(selectFromHistory({direction: 'left'}));
  };

  const onClickRightArrow = () => {
    dispatch(selectFromHistory({direction: 'right'}));
  };

  const applySelectedResource = useCallback(() => {
    if (selectedResource) {
      applyWithConfirm(selectedResource, resourceMap, fileMap, dispatch, kubeconfig);
    } else if (selectedPath) {
      applyFileWithConfirm(selectedPath, fileMap, dispatch, kubeconfig);
    }
  }, [selectedResource, resourceMap, fileMap, kubeconfig]);

  const diffSelectedResource = useCallback(() => {
    if (selectedResourceId) {
      dispatch(performResourceDiff(selectedResourceId));
    }
  }, [selectedResourceId]);

  useEffect(() => {
    if (selectedResourceId && resourceMap[selectedResourceId]) {
      setSelectedResource(resourceMap[selectedResourceId]);
    } else {
      setSelectedResource(undefined);
    }
  }, [selectedResourceId, resourceMap]);

  useEffect(() => {
    if (key === 'form' && (!selectedResourceId || selectedResource?.kind !== 'ConfigMap')) {
      setKey('source');
    }
  }, [selectedResourceId, selectedResource, key]);

  return (
    <>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>
            <TitleBarContainer>
              <span>Editor</span>
              <RightButtons>
                <StyledLeftArrowButton
                  onClick={onClickLeftArrow}
                  disabled={!isLeftArrowEnabled}
                  type="link"
                  size="small"
                  icon={<ArrowLeftOutlined />}
                />
                <StyledRightArrowButton
                  onClick={onClickRightArrow}
                  disabled={!isRightArrowEnabled}
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                />

                <Tooltip
                  mouseEnterDelay={TOOLTIP_DELAY}
                  title={selectedPath ? ApplyFileTooltip : ApplyTooltip}
                  placement="bottomLeft"
                >
                  <Button
                    loading={Boolean(applyingResource)}
                    type="primary"
                    size="small"
                    ghost
                    onClick={applySelectedResource}
                    disabled={!selectedResourceId && !selectedPath}
                  >
                    Apply
                  </Button>
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DiffTooltip} placement="bottomLeft">
                  <DiffButton
                    size="small"
                    type="primary"
                    ghost
                    onClick={diffSelectedResource}
                    disabled={!selectedResourceId}
                  >
                    Diff
                  </DiffButton>
                </Tooltip>
              </RightButtons>
            </TitleBarContainer>
          </MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>

      <ActionsPaneContainer>
        <Row>
          <Col span={24}>
            <StyledTabs defaultActiveKey="source" activeKey={key} onChange={k => setKey(k)}>
              <TabPane tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>} key="source">
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <StyledSkeleton active />
                ) : (
                  <Monaco editorHeight={`${parseInt(contentHeight, 10) - 120}`} />
                )}
              </TabPane>
              {selectedResource && selectedResource?.kind === 'ConfigMap' && (
                <TabPane
                  tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}
                  disabled={!selectedResourceId}
                  key="form"
                >
                  {uiState.isFolderLoading || previewLoader.isLoading ? (
                    <StyledSkeleton active />
                  ) : (
                    <FormEditor contentHeight={contentHeight} />
                  )}
                </TabPane>
              )}
            </StyledTabs>
          </Col>
        </Row>
      </ActionsPaneContainer>
    </>
  );
};

export default ActionsPane;
