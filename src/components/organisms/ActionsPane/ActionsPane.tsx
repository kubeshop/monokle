import React, {useCallback, useEffect, useState} from 'react';
import {Tabs, Col, Row, Button, Skeleton, Modal, Tooltip} from 'antd';
import styled from 'styled-components';
import {CodeOutlined, ContainerOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

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
import {ApplyTooltip, DiffTooltip, FormEditorTooltip, SourceEditorTooltip} from '@src/tooltips';
import {performResourceDiff} from '@redux/thunks/diffResource';
import {TOOLTIP_DELAY} from '@src/constants';

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
  width: 95%;
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

const ActionsPane = (props: {contentHeight: string}) => {
  const {contentHeight} = props;

  const selectedResourceId = useAppSelector(state => state.main.selectedResource);
  const applyingResource = useAppSelector(state => state.main.isApplyingResource);
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const dispatch = useAppDispatch();
  const kubeconfig = useAppSelector(state => state.config.kubeconfig);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const [key, setKey] = useState('source');

  const applySelectedResource = useCallback(() => {
    if (selectedResource) {
      applyWithConfirm(selectedResource, resourceMap, fileMap, dispatch, kubeconfig);
    }
  }, [selectedResource, resourceMap, fileMap, kubeconfig]);

  const diffSelectedResource = useCallback(() => {
    if (selectedResourceId) {
      dispatch(performResourceDiff(selectedResourceId));
    }
  }, [selectedResourceId]);

  useEffect(() => {
    if (selectedResourceId && resourceMap) {
      setSelectedResource(resourceMap[selectedResourceId]);
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
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ApplyTooltip}>
                  <Button
                    loading={Boolean(applyingResource)}
                    type="primary"
                    size="small"
                    ghost
                    onClick={applySelectedResource}
                    disabled={!selectedResourceId}
                  >
                    Apply
                  </Button>
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={DiffTooltip}>
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
              <TabPane
                tab={
                  <TabHeader icon={<CodeOutlined />} tooltip={SourceEditorTooltip}>
                    Source
                  </TabHeader>
                }
                key="source"
              >
                {uiState.isFolderLoading || previewLoader.isLoading ? (
                  <StyledSkeleton active />
                ) : (
                  <Monaco editorHeight={contentHeight} />
                )}
              </TabPane>
              {selectedResource && selectedResource?.kind === 'ConfigMap' && (
                <TabPane
                  tab={
                    <TabHeader icon={<ContainerOutlined />} tooltip={FormEditorTooltip}>
                      Form
                    </TabHeader>
                  }
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
