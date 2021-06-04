import * as React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";

const NavigatorPane = () => (
  <Container>
    <Row style={debugBorder}>
      <h5>navigator</h5>
    </Row>

    <Row style={debugBorder}>
      <Col>
        <Row style={debugBorder}>
          <h6>Kustomizations</h6>
        </Row>
        <Row style={debugBorder}>List</Row>
      </Col>
    </Row>

    <Row style={debugBorder}>
      <Col>
        <Row style={debugBorder}>
          <h6>k8s Resources</h6>
        </Row>
        <Row style={debugBorder}>
          <Col>
            <Row style={debugBorder}>
              <h6>Workloads</h6>
            </Row>
            <Row style={debugBorder}>
              <Col>
                ITEMS
              </Col>
            </Row>
            <Row style={debugBorder}>
              <h6>Configuration</h6>
            </Row>
            <Row style={debugBorder}>
              <Col>
                ITEMS
              </Col>
            </Row>
            <Row style={debugBorder}>
              <h6>Network</h6>
            </Row>
            <Row style={debugBorder}>
              <Col>
                ITEMS
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>

    <Row style={debugBorder}>Argo Rollouts</Row>
    <Row style={debugBorder}>Ambassador</Row>
    <Row style={debugBorder}>Prometheus</Row>
  </Container>
)

export default NavigatorPane;
