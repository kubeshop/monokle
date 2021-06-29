import * as React from 'react';
import 'antd/dist/antd.css';
import styled from 'styled-components';

import {useAppSelector} from '@redux/hooks';
import IconMonokle from '@components/atoms/IconMonokle';
import Row from '@components/atoms/Row';
import Col from '@components/atoms/Col';
import Header from '@components/atoms/Header';

const EditorMode = styled.h4`
  font-size: 1em;
  text-align: right;
  color: blue;
`;

const MiscDiv = styled.div`
  font-size: 1em;
  text-align: right;
  color: white;
`;

const PageHeader = () => {
  const isInPreviewMode = !!useAppSelector(state => state.main.previewResource);

  return (
    <Header noborder style={{
      zIndex: 1,
      width: '100%',
      height: '45px',
    }}>
      <Row noborder>
        <Col span={4} noborder>
          <IconMonokle useDarkTheme/>
        </Col>
        <Col span={4} offset={5}>
          <EditorMode>{isInPreviewMode ? 'Preview' : ''}</EditorMode>
        </Col>
        <Col span={5} offset={6}>
          <MiscDiv>user / signout / settings</MiscDiv>
        </Col>
      </Row>
    </Header>
  );
};

export default PageHeader;
