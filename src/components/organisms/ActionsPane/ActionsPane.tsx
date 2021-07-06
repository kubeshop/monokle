import {Tabs, Row, Col, Button, Space} from 'antd';
import styled from 'styled-components';
import {CodeOutlined, ContainerOutlined, ClusterOutlined} from '@ant-design/icons';

import {BackgroundColors} from '@styles/Colors';
import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import GraphView from '@molecules/GraphView';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {diffResource} from '@redux/reducers/thunks';
import {applyResource} from '@actions/common/apply';
import {useEffect, useState} from 'react';
import TabHeader from '@atoms/Tabs';
import MonoSectionTitle from '@atoms/MonoSectionTitle';
import MonoSectionHeader from '@atoms/MonoSectionHeader';

const ActionContainer = styled.div`
  background: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
`;

const {TabPane} = Tabs;

const StyledTabs = styled(Tabs)`
  & .ant-tabs-nav {
    padding: 0 16px;
  }
;

  & .ant-tabs-nav::before {
    border-bottom: 1px solid #363636;
  }
;
`;

const ActionsPane = (props: {actionHeight: string}) => {
  const {actionHeight} = props;
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const dispatch = useAppDispatch();
  const [key, setKey] = useState('source');

  async function applySelectedResource() {
    if (selectedResource) {
      applyResource(selectedResource, resourceMap, fileMap, dispatch);
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
    right: <Space>
      <Button onClick={applySelectedResource} disabled={!selectedResource} type='primary'>Apply</Button>
      <Button onClick={diffSelectedResource} disabled={!selectedResource} type='primary'>Diff</Button>
    </Space>,
  };

  return (
    <ActionContainer>
      <Row>
        <MonoSectionHeader>
          <MonoSectionTitle>Editor</MonoSectionTitle>
        </MonoSectionHeader>
      </Row>
      <Row>
        <Col span={24}>
          <StyledTabs
            defaultActiveKey='source'
            activeKey={key}
            onChange={k => setKey(k)}
            tabBarExtraContent={OperationsSlot}
          >
            <TabPane tab={<TabHeader icon={<CodeOutlined />}>Source</TabHeader>} key='source'>
              <Monaco editorHeight={actionHeight} />
            </TabPane>
            <TabPane tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}
                     disabled={!selectedResource}
                     key='form'>
              <FormEditor />
            </TabPane>
            <TabPane tab={<TabHeader icon={<ClusterOutlined />}>Graph</TabHeader>} key='graph'>
              <GraphView editorHeight={actionHeight} />
            </TabPane>

            {/* <Tab eventKey="logger" title="Logger">
              <LogViewer editorHeight={actionHeight} />
            </Tab> */}
          </StyledTabs>
        </Col>
      </Row>
    </ActionContainer>
  );
};

export default ActionsPane;
