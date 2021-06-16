import * as React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";

const Header = () => (
  <Container fluid>
    <Row style={debugBorder}>
      <Col sm={5}>
        <h4>ManifestUI / Monokle logo</h4>
      </Col>
    </Row>
  </Container>
)

export default Header;
