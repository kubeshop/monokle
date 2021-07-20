import {Tabs, Space, Col, Row, Button, Skeleton} from 'antd';
import styled from 'styled-components';
import {CodeOutlined, ContainerOutlined, ClusterOutlined} from '@ant-design/icons';

import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import GraphView from '@molecules/GraphView';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {diffResource} from '@redux/reducers/thunks';
import {applyResource} from '@actions/common/apply';
import {useEffect, useState} from 'react';
import TabHeader from '@atoms/TabHeader';
import {PaneContainer, MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

const {TabPane} = Tabs;

const StyledTabs = styled(Tabs)`
  & .ant-tabs-nav {
    padding: 0 16px;
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

const ActionsPane = (props: {contentHeight: string}) => {
  const {contentHeight} = props;

  const StyledSkeleton = styled(Skeleton)`
    margin: 20px;
    width: 95%;
  `;

  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const dispatch = useAppDispatch();
  const kubeconfig = useAppSelector(state => state.config.kubeconfig);
  const previewLoader = useAppSelector(state => state.main.previewLoader);
  const [key, setKey] = useState('source');

  async function applySelectedResource() {
    if (selectedResource) {
      applyResource(selectedResource, resourceMap, fileMap, dispatch, kubeconfig);
    }
  }

  async function diffSelectedResource() {
    if (selectedResource) {
      dispatch(diffResource(selectedResource));
    }
  }

  useEffect(() => {
    if (key === 'form' && !selectedResource) {
      setKey('source');
    }
  }, [selectedResource, key]);

  const OperationsSlot = {
    right: (
      <Space>
        <StyledButton type="primary" ghost onClick={applySelectedResource} disabled={!selectedResource}>
          Apply
        </StyledButton>
        <StyledButton type="primary" ghost onClick={diffSelectedResource} disabled={!selectedResource}>
          Diff
        </StyledButton>
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
              <TabPane tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>} key="source">
                {previewLoader.isLoading ? <StyledSkeleton /> : <Monaco editorHeight={contentHeight} />}
              </TabPane>
              <TabPane
                tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}
                disabled={!selectedResource}
                key="form"
              >
                {previewLoader.isLoading ? <StyledSkeleton /> : <FormEditor />}
              </TabPane>
              <TabPane tab={<TabHeader icon={<ClusterOutlined />}>Graph</TabHeader>} key="graph">
                {previewLoader.isLoading ? <StyledSkeleton /> : <GraphView editorHeight={contentHeight} />}
              </TabPane>
            </StyledTabs>
          </Col>
        </Row>
      </ActionsPaneContainer>
    </>
  );
};

export default ActionsPane;
