import * as React from 'react';
import {Button, Col, Container, Row, Tab, Tabs} from 'react-bootstrap';
import styled from 'styled-components';

import {appColors as colors} from '@styles/AppColors';
import Monaco from '@molecules/Monaco';
import LogViewer from '@molecules/LogViewer';
import FormEditor from '@molecules/FormEditor';
import GraphView from '@molecules/GraphView';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {applyResource} from '@actions/common/apply';
import {useEffect, useState} from 'react';

const ActionContainer = styled(Container)`
  background: ${colors.appNormalBackgroound};
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
`;

const TitleRow = styled(Row)`
  border: 1px solid blue;
  border-radius: 2px;
  background: ${colors.appNormalBackgroound};
  width: 100%;
  margin: 0;
  padding: 0;
`;

const SectionRow = styled(Row)`
  border: 1px solid blue;
  border-radius: 2px;
  background: ${colors.appNormalBackgroound};
  width: 100%;
  margin: 0;
  padding: 0;
`;

const SectionCol = styled(Col)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const Title = styled.h4`
  font-size: 1.5em;
  text-align: center;
  color: tomato;
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

  useEffect(() => {
    if (key === 'form' && !selectedResource) {
      setKey('source');
    }
  }, [selectedResource]);

  return (
    <ActionContainer>
      <TitleRow>
        <Title>Editors/Actions</Title>
      </TitleRow>
      <SectionRow>
        <Button
          variant="outline-dark"
          size="sm"
          onClick={applySelectedResource}
          disabled={selectedResource === undefined}
        >
          Apply
        </Button>
      </SectionRow>
      <SectionRow>
        <SectionCol>
          <Tabs
            defaultActiveKey="source"
            id="uncontrolled-tab-example"
            activeKey={key}
            onSelect={k => {
              if (k) setKey(k);
            }}
          >
            <Tab eventKey="source" title="Source">
              <Monaco editorHeight={actionHeight} />
            </Tab>
            <Tab eventKey="form" title="Form" disabled={!selectedResource}>
              <FormEditor />
            </Tab>
            <Tab eventKey="graph" title="Graph">
              <GraphView editorHeight={actionHeight} />
            </Tab>
            <Tab eventKey="logger" title="Logger">
              <LogViewer editorHeight={actionHeight} />
            </Tab>
          </Tabs>
        </SectionCol>
      </SectionRow>
    </ActionContainer>
  );
};

export default ActionsPane;
