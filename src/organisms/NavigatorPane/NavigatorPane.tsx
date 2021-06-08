import React, { FC } from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import {AppConfig, K8sResource} from "../../models/state";
import micromatch from 'micromatch';

interface NavigatorPaneState {
  resourceMap: Map<string, K8sResource>,
  appConfig: AppConfig,
}

const NavigatorPane: FC<NavigatorPaneState> = ({resourceMap, appConfig}) => {
  const selectItem = function(item:string) {
    console.log( item )
  }

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
                  <h4>{navigator.name}</h4>
                </Row>
                <Row style={debugBorder}>
                  <Col>
                    {navigator.sections.map(section => {
                      return (
                        <>
                          {section.name.length > 0 &&
                            <Row style={debugBorder}>
                              <h5>{section.name}</h5>
                            </Row>
                          }
                          <Row style={debugBorder}>
                            {section.subsections.map(subsection => {
                              const items = Array.from(resourceMap.values()).filter(item =>
                                item.kind === subsection.kindSelector &&
                                micromatch.isMatch(item.version, subsection.apiVersionSelector)
                              );
                              return (
                                <Col key={subsection.name}>
                                  {subsection.name} {items.length > 0 ? "(" + items.length + ")":""}
                                  {
                                    items.map(item => {
                                      return (
                                        <div key={item.id} onClick={() => selectItem(item.id)}>- {item.name}</div>
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
    </Container>
  )
}

export default NavigatorPane;
