import React from 'react';
import './App.css';
import {Col, Container, Row} from 'react-bootstrap';
import Footer from "./organisms/Footer";
import {debugBorder} from "./styles/DebugStyles";
import ActionsPane from "./organisms/ActionsPane";
import NavigatorPane from "./organisms/NavigatorPane";
import FileTreePane from "./organisms/FileTreePane";
import Header from "./organisms/Header";
import { loader } from '@monaco-editor/react';
const path = require('path');

function ensureFirstBackSlash(str:string) {
  return str.length > 0 && str.charAt(0) !== "/"
      ? "/" + str
      : str;
}

function uriFromPath(_path: any) {
  const pathName = path.resolve(_path).replace(/\\/g, "/");
  return encodeURI("file://" + ensureFirstBackSlash(pathName));
}

let p = path.join(__dirname, "../../../../../../../../node_modules/monaco-editor/min/vs")
loader.config({
  paths: {
    vs: uriFromPath( p )
  }
});

function App() {
  return (
      <div>
        <Container fluid>
          <Row style={debugBorder}>
            <Header/>
          </Row>
          <Row style={debugBorder}>
            <Col sm={3} style={debugBorder}>
              <FileTreePane/>
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
