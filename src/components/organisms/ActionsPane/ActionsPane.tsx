import {Tabs, Space, Col, Row} from 'antd';
import styled from 'styled-components';
import {CodeOutlined, ContainerOutlined} from '@ant-design/icons';

import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {diffResource} from '@redux/reducers/thunks';
import {applyResource} from '@actions/common/apply';
import {useEffect, useState} from 'react';
import TabHeader from '@atoms/TabHeader';
import {
  MonoButton,
  PaneContainer,
  MonoPaneTitle,
  MonoPaneTitleCol,
} from '@atoms';

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
      <MonoButton onClick={applySelectedResource} disabled={!selectedResource} type='primary'>Apply</MonoButton>
      <MonoButton onClick={diffSelectedResource} disabled={!selectedResource} type='primary'>Diff</MonoButton>
    </Space>,
  };

  const resource = selectedResource && resourceMap ? resourceMap[selectedResource] : undefined;

  return (
    <PaneContainer>
      <Row>
        <MonoPaneTitleCol>
          <MonoPaneTitle>Editor</MonoPaneTitle>
        </MonoPaneTitleCol>
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

            {resource?.kind === 'ConfigMap' &&
            <TabPane tab={<TabHeader icon={<ContainerOutlined />}>Form</TabHeader>}
                     disabled={!selectedResource}
                     key='form'>
              <FormEditor />
            </TabPane>
            }
            {/* <TabPane tab={<TabHeader icon={<ClusterOutlined />}>Graph (alpha)</TabHeader>} key='graph'>
              <GraphView editorHeight={actionHeight} />
            </TabPane>

             <Tab eventKey="logger" title="Logger">
              <LogViewer editorHeight={actionHeight} />
            </Tab> */}
          </StyledTabs>
        </Col>
      </Row>
    </PaneContainer>
  );
};

export default ActionsPane;
