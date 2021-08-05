import React, {useEffect, useState} from 'react';
import {Tabs, Space, Col, Row, Button, Skeleton, Modal, Tooltip} from 'antd';
import styled from 'styled-components';
import {CodeOutlined, ContainerOutlined, ExclamationCircleOutlined} from '@ant-design/icons';

import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {diffResource} from '@redux/reducers/thunks';
import {applyResource} from '@actions/common/apply';
import TabHeader from '@atoms/TabHeader';
import {PaneContainer, MonoPaneTitle, MonoPaneTitleCol} from '@atoms';
import {K8sResource} from '@models/k8sresource';
import {isKustomizationResource} from '@redux/utils/kustomize';
import {FileMapType, ResourceMapType} from '@models/appstate';
import {ThunkDispatch} from 'redux-thunk';
import {ApplyTooltip, DiffTooltip, FormEditorTooltip, SourceEditorTooltip} from '@src/tooltips';

const {TabPane} = Tabs;

const StyledTabs = styled(Tabs)`
  & .ant-tabs-nav {
    padding: 0 16px;
    margin-bottom: 10px;
  }

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }
`;

const ActionsPaneContainer = styled(PaneContainer)`
  height: 100%;
  overflow-y: hidden;
`;

const StyledButton = styled(Button)`
  padding: 0px 10px;
  height: 30px;
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
  const [selectedResource, setSelectedResource] = useState<K8sResource>();
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const dispatch = useAppDispatch();
  const kubeconfig = useAppSelector(state => state.config.kubeconfig);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const uiState = useAppSelector(state => state.ui);
  const [key, setKey] = useState('source');

  async function applySelectedResource() {
    if (selectedResource) {
      applyWithConfirm(selectedResource, resourceMap, fileMap, dispatch, kubeconfig);
    }
  }

  async function diffSelectedResource() {
    if (selectedResourceId) {
      dispatch(diffResource(selectedResourceId));
    }
  }

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

  const OperationsSlot = {
    right: (
      <Space>
        <Tooltip title={ApplyTooltip}>
          <StyledButton type="primary" ghost onClick={applySelectedResource} disabled={!selectedResource}>
            Apply
          </StyledButton>
        </Tooltip>
        <Tooltip title={DiffTooltip}>
          <StyledButton type="primary" ghost onClick={diffSelectedResource} disabled={!selectedResource}>
            Diff
          </StyledButton>
        </Tooltip>
      </Space>
    ),
  };

  return (
    <>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>Editor</MonoPaneTitle>
        </MonoPaneTitleCol>
      </Row>

      <ActionsPaneContainer>
        <Row>
          <Col span={24}>
            <StyledTabs
              defaultActiveKey="source"
              activeKey={key}
              onChange={k => setKey(k)}
              tabBarExtraContent={OperationsSlot}
            >
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
