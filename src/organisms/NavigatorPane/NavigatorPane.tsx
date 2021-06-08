import React, {FC, useCallback} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import {AppConfig, K8sResource} from "../../models/state";
import micromatch from 'micromatch';
import "../../styles/NavigatorPane.css"
import {useDispatch} from "react-redux";
import {selectKustomization} from "../../store/actionCreators";

interface NavigatorPaneState {
  resourceMap: Map<string, K8sResource>,
  appConfig: AppConfig,
}

const NavigatorPane: FC<NavigatorPaneState> = ({resourceMap, appConfig}) => {
  const dispatch = useDispatch()

  const selectItem = function (item: string) {
    console.log(item)
  }

  const selectKustomizationItem = useCallback(
    (item: string) => {
      dispatch(selectKustomization(item, resourceMap))
    }, [dispatch, resourceMap]
  )

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
          {
            Array.from(resourceMap.values()).filter(item => item.kind === "Kustomization").map(item => {

              let className = ""
              if (item.highlight) {
                className = "highlightItem"
              } else if (item.selected) {
                className = "selectedItem"
              }

              return (
                <div key={item.id} className={className}
                     onClick={() => selectKustomizationItem(item.id)}>{item.name}</div>
              )
            })
          }
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
                                  {subsection.name} {items.length > 0 ? "(" + items.length + ")" : ""}
                                  {
                                    items.map(item => {
                                      let className = ""
                                      if (item.highlight) {
                                        className = "highlightItem"
                                      } else if (item.selected) {
                                        className = "selectedItem"
                                      }
                                      return (
                                        <div key={item.id} className={className}
                                             onClick={() => selectItem(item.id)}>- {item.name}</div>
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
