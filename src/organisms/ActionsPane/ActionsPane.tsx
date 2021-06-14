import * as React from 'react';
import {
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import Monaco from '../../molecules/Monaco';
import FormEditor from '../../molecules/FormEditor';
import GraphView from '../../molecules/GraphView';

const ActionsPane = () => (
  <Container>
    <Row style={debugBorder}>
      <h5>Actions</h5>
    </Row>
    <Row style={debugBorder}>
      <Col>
        <Tabs defaultActiveKey='edit' id='uncontrolled-tab-example'>
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

export default ActionsPane;
