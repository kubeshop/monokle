import React from 'react';
import './App.css';
import {Col, Container, Row} from 'react-bootstrap';
import Footer from "./organisms/Footer";
import {debugBorder} from "./styles/DebugStyles";
import ActionsPane from "./organisms/ActionsPane";
import NavigatorPane from "./organisms/NavigatorPane";
import FileTreePane from "./organisms/FileTreePane";
import Header from "./organisms/Header";
import {AppState} from "./models/state";
import {useSelector} from "react-redux";

const App: React.FC = () => {

  const state: AppState = useSelector(
    (state: AppState) => state
  )

  return (
    <div>
      <Container fluid>
        <Row style={debugBorder}>
          <Header/>
        </Row>
        <Row style={debugBorder}>
          <Col sm={3} style={debugBorder}>
            <FileTreePane rootFolder={state.rootFolder} files={state.files}/>
          </Col>

          <Col sm={3} style={debugBorder}>
            <NavigatorPane/>
          </Col>

          <Col sm={6} style={debugBorder}>
            <ActionsPane/>
          </Col>
        </Row>
        <Row style={debugBorder}>
          <Footer/>
        </Row>
      </Container>
    </div>
  );
}

export default App;
