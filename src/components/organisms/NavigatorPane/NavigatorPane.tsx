import React, {useEffect, useState} from 'react';
import {Col, Row} from 'antd';
import styled from 'styled-components';

import {BackgroundColors} from '@styles/Colors';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {getNamespaces} from '@redux/utils/resource';
import {setFilterObjects} from '@redux/reducers/appConfig';
import {MonoSwitch, MonoPaneTitle, MonoPaneTitleCol} from '@atoms';

import NavigatorContent from './components/NavigatorContent';
import {ALL_NAMESPACES} from './constants';

const TitleRow = styled(Row)`
  width: 100%;
  margin: 0;
  padding: 0;
  background: ${BackgroundColors.darkThemeBackground};
`;

const NavigatorPane = () => {
  const dispatch = useAppDispatch();
  const [namespace, setNamespace] = useState<string>(ALL_NAMESPACES);
  const [namespaces, setNamespaces] = useState<string[]>([ALL_NAMESPACES]);

  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const previewResource = useAppSelector(state => state.main.previewResource);

  const onFilterChange = (checked: boolean) => {
    dispatch(setFilterObjects(checked));
  };

  useEffect(() => {
    let ns = getNamespaces(resourceMap);
    setNamespaces(ns.concat([ALL_NAMESPACES]));
    if (namespace && ns.indexOf(namespace) === -1) {
      setNamespace(ALL_NAMESPACES);
    }
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [resourceMap, previewResource]); // es-lint-disable

  return (
    <>
      <TitleRow>
        <MonoPaneTitleCol span={24}>
          <Row>
            <Col span={12}>
              <MonoPaneTitle>Navigator</MonoPaneTitle>
            </Col>
            <Col span={12}>
              <MonoSwitch onClick={onFilterChange} label="RELATIONS" />
            </Col>
          </Row>
        </MonoPaneTitleCol>
      </TitleRow>
      <NavigatorContent namespace={namespace} namespaces={namespaces} setNamespace={setNamespace} />
    </>
  );
};

export default NavigatorPane;
