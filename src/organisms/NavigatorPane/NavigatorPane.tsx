import React, {FC, useCallback} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {debugBorder} from "../../styles/DebugStyles";
import {AppConfig, K8sResource} from "../../models/state";
import micromatch from 'micromatch';
import "../../styles/NavigatorPane.css"
import {useDispatch} from "react-redux";
import {selectK8sResource, selectKustomization, setFilterObjectsOnSelection} from "../../store/actionCreators";

interface NavigatorPaneState {
  resourceMap: Map<string, K8sResource>,
  appConfig: AppConfig,
}

const NavigatorPane: FC<NavigatorPaneState> = ({resourceMap, appConfig}) => {
  const dispatch = useDispatch()

  const selectItem = useCallback(
    (item: string) => {
      dispatch(selectK8sResource(item, resourceMap))
    }, [dispatch, resourceMap]
  )

  const selectKustomizationItem = useCallback(
    (item: string) => {
      dispatch(selectKustomization(item, resourceMap))
    }, [dispatch, resourceMap]
  )

  const onFilterChange = useCallback(
    (e: any) => {
      dispatch(setFilterObjectsOnSelection(e.target.checked))
    }, [dispatch])

  // this should probably come from app state instead of being calculated
  const selection = Array.from(resourceMap.values()).find(item => item.selected);

  return (
    <Container>
      <Row style={debugBorder}>
        <h5>navigator</h5>
      </Row>

      <Row style={debugBorder}>
        <Col>
          <Row style={debugBorder}>
            <Col>
              <h5>Kustomizations</h5>
            </Col>
            <Col><input type="checkbox" onChange={onFilterChange}/> filter selected</Col>
          </Row>
          {
            Array.from(resourceMap.values()).filter(item => item.kind === "Kustomization" &&
              (!appConfig.settings.filterObjectsOnSelection || !selection || selection.kind === "Kustomization" || item.highlight || item.selected)).map(item => {
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
                                (!appConfig.settings.filterObjectsOnSelection || !selection || item.highlight || item.selected) &&
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
