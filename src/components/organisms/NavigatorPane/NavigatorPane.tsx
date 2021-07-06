import React, {useState} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import styled from 'styled-components';
import micromatch from 'micromatch';
import {useSelector} from 'react-redux';

import '@styles/NavigatorPane.css';
import {BackgroundColors} from '@styles/Colors';
import {selectK8sResource} from '@redux/reducers/main';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {getNamespaces} from '@redux/utils/resource';
import {setFilterObjects} from '@redux/reducers/appConfig';
import {selectKustomizations, selectActiveResources} from '@redux/selectors';
import {K8sResource} from '@models/k8sresource';
import {NavigatorSubSection} from '@models/navigator';
import {hasIncomingRefs, hasOutgoingRefs, hasUnsatisfiedRefs} from '@redux/utils/resourceRefs';
import {previewKustomization} from '@redux/reducers/thunks';

import MonoSectionTitle from '@atoms/MonoSectionTitle';
import MonoSectionHeader from '@atoms/MonoSectionHeader';

const ALL_NAMESPACES = '- all -';

const NavContainer = styled(Container)`
  background: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
`;

const TitleRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const SectionRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const ItemRow = styled(Row)`
  background: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  margin: 0;
  padding: 0;
`;

const SectionCol = styled(Col)`
  width: 100%;
  margin: 0;
  padding: 0;
`;

const StyledCheckBox = styled.input`
  float: right;
`;

const StyledCheckBoxText = styled.h6`
  float: right;
`;

const SectionTitle = styled.h5`
  font-size: 1.2em;
  text-align: center;
  color: tomato;
`;

const NavigatorPane = () => {
  const dispatch = useAppDispatch();
  const [namespace, setNamespace] = useState<string>(ALL_NAMESPACES);

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const selectedResource = useAppSelector(state => state.main.selectedResource);
  const previewResource = useAppSelector(state => state.main.previewResource);
  const appConfig = useAppSelector(state => state.config);
  const kustomizations = useSelector(selectKustomizations);
  const resources = useSelector(selectActiveResources);

  const selectResource = (resourceId: string) => {
    dispatch(selectK8sResource(resourceId));
  };

  const onFilterChange = (e: any) => {
    dispatch(setFilterObjects(e.target.checked));
  };

  const handleNamespaceChange = (event: any) => {
    setNamespace(event.target.value);
  };

  const selectPreview = (id: string) => {
    if (id !== selectedResource) {
      dispatch(selectK8sResource(id));
    }
    dispatch(previewKustomization(id));
  };

  function shouldBeVisible(item: K8sResource, subsection: NavigatorSubSection) {
    return (
      (!appConfig.settings.filterObjectsOnSelection || item.highlight || item.selected || !selectedResource) &&
      item.kind === subsection.kindSelector &&
      micromatch.isMatch(item.version, subsection.apiVersionSelector) &&
      (namespace === ALL_NAMESPACES || item.namespace === namespace || (namespace === 'default' && !item.namespace))
    );
  }

  return (
    <NavContainer>
      <TitleRow>
        <MonoSectionHeader span={24}>
          <SectionRow>
            <SectionCol span={12}>
              <MonoSectionTitle>Navigator</MonoSectionTitle>
            </SectionCol>
            <SectionCol span={12}>
              <StyledCheckBox type="checkbox" onChange={onFilterChange} />
              <StyledCheckBoxText>Show Relations</StyledCheckBoxText>
            </SectionCol>
          </SectionRow>
        </MonoSectionHeader>
      </TitleRow>

      {kustomizations.length > 0 && (
        <SectionRow>
          <SectionCol>
            <SectionRow>
              <SectionCol>
                <SectionTitle>Kustomizations</SectionTitle>
              </SectionCol>
            </SectionRow>
            {kustomizations
              .filter(
                k =>
                  !appConfig.settings.filterObjectsOnSelection ||
                  k.highlight ||
                  k.selected ||
                  !selectedResource ||
                  previewResource === k.id
              )
              .map((k: K8sResource) => {
                let className = '';
                if (previewResource && previewResource !== k.id) {
                  className = 'disabledItem';
                } else if (k.selected || previewResource === k.id) {
                  className = 'selectedItem';
                } else if (k.highlight) {
                  className = 'highlightItem';
                }

                return (
                  <ItemRow key={k.id}>
                    <SectionCol sm={9}>
                      <div
                        className={className}
                        onClick={!previewResource || previewResource === k.id ? () => selectResource(k.id) : undefined}
                      >
                        {hasIncomingRefs(k) ? '>> ' : ''}
                        {k.name}
                        {hasOutgoingRefs(k) ? ' >>' : ''}
                      </div>
                    </SectionCol>
                    <SectionCol sm={3}>
                      <Button
                        variant="outline-dark"
                        size="sm"
                        onClick={() => selectPreview(k.id)}
                        active={previewResource !== undefined && previewResource === k.id}
                        disabled={previewResource !== undefined && previewResource !== k.id}
                      >
                        Preview
                      </Button>
                    </SectionCol>
                  </ItemRow>
                );
              })}
          </SectionCol>
        </SectionRow>
      )}
      <SectionRow>
        Filter namespace:
        <select onChange={handleNamespaceChange}>
          <option>{ALL_NAMESPACES}</option>
          {getNamespaces(resourceMap).map(n => {
            return <option key={n}>{n}</option>;
          })}
        </select>
      </SectionRow>

      <SectionRow>
        <SectionCol>
          {appConfig.navigators.map(navigator => {
            return (
              <>
                <SectionRow>
                  <SectionTitle>{navigator.name}</SectionTitle>
                </SectionRow>
                <SectionRow>
                  <SectionCol>
                    {navigator.sections.map(section => {
                      return (
                        <>
                          {section.name.length > 0 && (
                            <SectionRow>
                              <h6>{section.name}</h6>
                            </SectionRow>
                          )}
                          <SectionRow key={section.name}>
                            {section.subsections.map(subsection => {
                              const items = resources.filter(item => shouldBeVisible(item, subsection));
                              return (
                                <SectionCol key={subsection.name}>
                                  <h6>
                                    {subsection.name} {items.length > 0 ? `(${items.length})` : ''}
                                  </h6>
                                  {items.map(item => {
                                    let className = '';
                                    if (item.highlight) {
                                      className = 'highlightItem';
                                    } else if (item.selected) {
                                      className = 'selectedItem';
                                    }
                                    return (
                                      <div key={item.id} className={className} onClick={() => selectResource(item.id)}>
                                        {hasIncomingRefs(item) ? '>> ' : ''}
                                        {item.name}
                                        {hasOutgoingRefs(item) ? ' >>' : ''}
                                        {hasUnsatisfiedRefs(item) ? ' ??' : ''}
                                      </div>
                                    );
                                  })}
                                </SectionCol>
                              );
                            })}
                          </SectionRow>
                        </>
                      );
                    })}
                  </SectionCol>
                </SectionRow>
              </>
            );
          })}
        </SectionCol>
      </SectionRow>
    </NavContainer>
  );
};

export default NavigatorPane;
