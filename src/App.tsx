import React from 'react';
import './App.css';
import { Col, Container, Row } from 'react-bootstrap';
import Footer from './organisms/Footer';
import { debugBorder } from './styles/DebugStyles';
import ActionsPane from './organisms/ActionsPane';
import NavigatorPane from './organisms/NavigatorPane';
import FileTreePane from './organisms/FileTreePane';
import Header from './organisms/Header';
import MessageBox from './organisms/MessageBox/MessageBox';

const App = () => {
  return (
    <div>
      <MessageBox />
      <Container fluid>
        <Row>
          <Header />
        </Row>
        <Row style={debugBorder}>
          <Col sm={3} style={debugBorder}>
            <FileTreePane />
          </Col>

          <Col sm={3} style={debugBorder}>
            <NavigatorPane/>
          </Col>

          <Col sm={6} style={debugBorder}>
            <ActionsPane />
          </Col>
        </Row>
        <Row style={debugBorder}>
          <Footer/>
        </Row>
      </Container>
    </div>
  );
};

export default App;
