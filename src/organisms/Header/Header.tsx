import * as React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";

const Header = () => (
  <Container fluid>
    <Row style={debugBorder}>
      <Col sm={5}>
        <h4>Logged in as</h4>
      </Col>
      <Col sm={3}>
        <h4 style={{color: 'blue'}}>someone</h4>
      </Col>
      <Col sm={4}>
        <button>Logout</button>
      </Col>
    </Row>
  </Container>
)

export default Header;
