import React, {useState, useEffect} from 'react';
import {Col, Row} from 'react-bootstrap';
import styled from 'styled-components';
import Layout from '@atoms/Layout';
import 'antd/dist/antd.css';

import './App.css';
import Footer from '@organisms/Footer';
import ActionsPane from '@organisms/ActionsPane';
import NavigatorPane from '@organisms/NavigatorPane';
import FileTreePane from '@organisms/FileTreePane';
import PageHeader from '@organisms/PageHeader';
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

const App = () => {
  const size: Size = useWindowSize();

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 60 : 40}px`;

  return (
    <div>
      <MessageBox />
      <Layout mainheight={mainHeight} isPageContainer>
        <PageHeader />
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
      </Layout>
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
