import * as React from 'react';
import {Button, Col, Container, Row, Tab, Tabs} from 'react-bootstrap';
import styled from 'styled-components';

import {appColors as colors} from '@styles/AppColors';
import Monaco from '@molecules/Monaco';
import FormEditor from '@molecules/FormEditor';
import GraphView from '@molecules/GraphView';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {applyResource} from '@actions/common/apply';

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

const ActionsPane = () => {
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const dispatch = useAppDispatch();

  async function applySelectedResource() {
    if (selectedResource) {
      applyResource(selectedResource, resourceMap, dispatch);
    }
  }

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
          <Tabs defaultActiveKey="source" id="uncontrolled-tab-example">
            <Tab eventKey="source" title="Source">
              <Monaco />
            </Tab>
            <Tab eventKey="form" title="Form">
              <FormEditor />
            </Tab>
            <Tab eventKey="graph" title="Graph">
              <GraphView />
            </Tab>
          </Tabs>
        </SectionCol>
      </SectionRow>
    </ActionContainer>
  );
};

export default ActionsPane;
