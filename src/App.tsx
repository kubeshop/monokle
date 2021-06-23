import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import styled from 'styled-components';

import './App.css';
import Footer from '@organisms/Footer';
import ActionsPane from '@organisms/ActionsPane';
import NavigatorPane from '@organisms/NavigatorPane';
import FileTreePane from '@organisms/FileTreePane';
import Header from '@organisms/Header';
import MessageBox from '@organisms/MessageBox';

const ContentColumn = styled(Col)`
  border: 3px solid blue;
  border-radius: 2px;
  background: papayawhip;
  width: 100%;
  height: 100%;
  padding: 0px;
  overflow-y: scroll;
`;

const App = () => {
  return (
    <div>
      <MessageBox />
      <Container fluid>
        <Row>
          <Header />
        </Row>
        <Row>
          <ContentColumn sm={3}>
            <FileTreePane />
          </ContentColumn>

          <ContentColumn sm={3}>
            <NavigatorPane />
          </ContentColumn>

          <ContentColumn sm={6}>
            <ActionsPane />
          </ContentColumn>
        </Row>
        <Row>
          <Footer />
        </Row>
      </Container>
    </div>
  );
};

export default App;
