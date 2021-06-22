import * as React from 'react';
import {
  Button,
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import { debugBorder } from '../../styles/DebugStyles';
import Monaco from '../../molecules/Monaco';
import FormEditor from '../../molecules/FormEditor';
import GraphView from '../../molecules/GraphView';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { applyResource } from '../../actions/common/apply';

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
    <Container>
      <Row style={debugBorder}>
        <h4>Editors/Actions</h4>
      </Row>
      <Row>
        <Button variant='outline-dark' size='sm' onClick={applySelectedResource}
                disabled={selectedResource === undefined}>Apply</Button>
      </Row>
      <Row style={debugBorder}>
        <Col>
          <Tabs defaultActiveKey='source' id='uncontrolled-tab-example'>
            <Tab eventKey='source' title='Source'>
              <Monaco />
            </Tab>
            <Tab eventKey='form' title='Form'>
              <FormEditor />
            </Tab>
            <Tab eventKey='graph' title='Graph'>
              <GraphView />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default ActionsPane;
