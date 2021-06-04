import * as React from 'react';
import {
  Col, Container, Row, Tab, Tabs,
} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import Monaco from "../../molecules/Monaco";

const ActionsPane = () => (
  <Container>
    <Row style={debugBorder}>
      <h5>Actions</h5>
    </Row>
    <Row style={debugBorder}>
      <Col>
        <Tabs defaultActiveKey="edit" id="uncontrolled-tab-example">
          <Tab eventKey="edit" title="edit">
              <Monaco/>
          </Tab>
          <Tab eventKey="action2" title="Action 2" disabled>
            lorem ipsum etc etc
          </Tab>
          <Tab eventKey="action3" title="Action 3" disabled>
            lorem ipsum etc etc
          </Tab>
        </Tabs>
      </Col>
    </Row>
  </Container>
);

export default ActionsPane;
