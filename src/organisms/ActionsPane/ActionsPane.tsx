import * as React from 'react';
import {
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import Monaco from '../../molecules/Monaco';
import FormEditor from '../../molecules/FormEditor';

const ActionsPane = () => (
  <Container>
    <Row style={debugBorder}>
      <h5>Actions</h5>
    </Row>
    <Row style={debugBorder}>
      <Col>
        <Tabs defaultActiveKey='edit' id='uncontrolled-tab-example'>
          <Tab eventKey='edit' title='Source'>
            <Monaco />
          </Tab>
          <Tab eventKey='action2' title='Form'>
            <FormEditor />
          </Tab>
          <Tab eventKey='action3' title='Graph' disabled>
            lorem ipsum etc etc
          </Tab>
        </Tabs>
      </Col>
    </Row>
  </Container>
);

export default ActionsPane;
