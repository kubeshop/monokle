import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { debugBorder } from '../../styles/DebugStyles';
import { K8sResource } from '../../models/state';
import micromatch from 'micromatch';
import '../../styles/NavigatorPane.css';
import { selectK8sResource, selectKustomization, setFilterObjects } from '../../redux/reducer';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { hasIncomingRefs, hasOutgoingRefs } from '../../redux/utils/resource';

const NavigatorPane = () => {
  const dispatch = useAppDispatch();

  const resourceMap = useAppSelector(state => state.resourceMap);
  const appConfig = useAppSelector(state => state.appConfig);

  const selectItem = (item: string) => {
    dispatch(selectK8sResource(item));
  };

  const selectKustomizationItem = (resourceId: string) => {
    dispatch(selectKustomization(resourceId));
  };

  const onFilterChange = (e: any) => {
    dispatch(setFilterObjects(e.target.checked));
  };

  // this should probably come from app state instead of being calculated
  const selection = Object.values(resourceMap).find(item => item.selected);

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
            <Col><input type='checkbox' onChange={onFilterChange} /> filter selected</Col>
          </Row>
          {
            Object.values(resourceMap).filter((item: K8sResource) => item.kind === 'Kustomization' &&
              (!appConfig.settings.filterObjectsOnSelection || !selection || selection.kind === 'Kustomization' || item.highlight || item.selected))
              .map((item: K8sResource) => {
                let className = '';
                if (item.highlight) {
                  className = 'highlightItem';
                } else if (item.selected) {
                  className = 'selectedItem';
                }

                return (
                  <div key={item.id} className={className}
                       onClick={() => selectKustomizationItem(item.id)}>
                    {hasIncomingRefs(item) ? '>> ' : ''}
                    {item.name}
                    {hasOutgoingRefs(item) ? ' >>' : ''}</div>
                );
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
                          <Row key={section.name} style={debugBorder}>
                            {section.subsections.map(subsection => {
                              const items = Object.values(resourceMap).filter(item =>
                                (!appConfig.settings.filterObjectsOnSelection || !selection || item.highlight || item.selected) &&
                                item.kind === subsection.kindSelector &&
                                micromatch.isMatch(item.version, subsection.apiVersionSelector),
                              );
                              return (
                                <Col key={subsection.name} style={debugBorder}>
                                  <h6>{subsection.name} {items.length > 0 ? '(' + items.length + ')' : ''}</h6>
                                  {
                                    items.map(item => {
                                      let className = '';
                                      if (item.highlight) {
                                        className = 'highlightItem';
                                      } else if (item.selected) {
                                        className = 'selectedItem';
                                      }
                                      return (
                                        <div key={item.id} className={className}
                                             onClick={() => selectItem(item.id)}>
                                          {hasIncomingRefs(item) ? '>> ' : ''}
                                          {item.name}
                                          {hasOutgoingRefs(item) ? ' >>' : ''}
                                        </div>
                                      );
                                    })
                                  }
                                </Col>
                              );
                            })
                            }
                          </Row>
                        </>
                      );
                    })
                    }
                  </Col>
                </Row>
              </>
            );
          })
          }
        </Col>
      </Row>
    </Container>
  );
};

export default NavigatorPane;
