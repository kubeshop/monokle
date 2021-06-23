import React, {useState, useEffect} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import styled from 'styled-components';

import './App.css';
import Footer from '@organisms/Footer';
import ActionsPane from '@organisms/ActionsPane';
import NavigatorPane from '@organisms/NavigatorPane';
import FileTreePane from '@organisms/FileTreePane';
import Header from '@organisms/Header';
import MessageBox from '@organisms/MessageBox';
import {Size} from '@models/window';

const ContentColumn = styled(Col)`
  width: 100%;
  height: 100%;
  padding: 0px;
  overflow-y: scroll;
`;

const ContentRow = styled(Row)`
  width: 100%;
  height: ${props => props.rowHeight || '1em'};
  padding: 0px;
  margin: 0px;
  overflow-y: hidden;
`;

const MainContainer = styled(Container)`
  width: 100%;
  height: ${props => props.mainHeight || '100px'};
  padding: 0px;
  overflow-y: clip;
`;


const App = () => {
  const size: Size = useWindowSize();

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 60 : 40}px`;

  return (
    <div>
      <MessageBox />
      <MainContainer mainHeight={mainHeight} fluid>
        <ContentRow rowHeight='40px'>
          <Header />
        </ContentRow>
        <ContentRow rowHeight={contentHeight}>
          <ContentColumn sm={3}>
            <FileTreePane />
          </ContentColumn>

          <ContentColumn sm={3}>
            <NavigatorPane/>
          </ContentColumn>

          <ContentColumn sm={6}>
            <ActionsPane actionHeight={contentHeight}/>
          </ContentColumn>
        </ContentRow>
        <ContentRow rowHeight='20px'>
          <Footer />
        </ContentRow>
      </MainContainer>
    </div>
  );
};

export default App;

function useWindowSize(): Size {
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
