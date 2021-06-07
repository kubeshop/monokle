import * as React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import {AppConfig, K8sResource} from "../../models/state";
import {FC} from "react";

interface NavigatorPaneState {
  resourceMap: Map<string, K8sResource>,
  appConfig: AppConfig,
}

const NavigatorPane: FC<NavigatorPaneState> = ({resourceMap, appConfig}) => {
  return (
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
          {appConfig.navigators.map(navigator => {
            return (
              <>
                <Row style={debugBorder}>
                  <h6>{navigator.name}</h6>
                </Row>
                <Row style={debugBorder}>
                  <Col>
                    {navigator.sections.map(section => {
                      return (
                        <>
                          <Row style={debugBorder}>
                            <h6>{section.name}</h6>
                          </Row>
                          <Row style={debugBorder}>
                            {section.subsections.map(subsection => {
                              return (
                                <Col key={subsection.name}>
                                  {subsection.name}
                                  {
                                    Array.from(resourceMap.values()).filter(item => item.kind === subsection.kindSelector).map(item => {
                                      return (
                                        <div key={item.id}>- {item.name}</div>
                                      )
                                    })
                                  }
                                </Col>
                              )
                            })
                            }
                          </Row>
                        </>
                      )
                    })
                    }
                  </Col>
                </Row>
              </>
            )
          })
          }
        </Col>
      </Row>

      <Row style={debugBorder}>Argo Rollouts</Row>
      <Row style={debugBorder}>Ambassador</Row>
      <Row style={debugBorder}>Prometheus</Row>
    </Container>
  )
}

export default NavigatorPane;
