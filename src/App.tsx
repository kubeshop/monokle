import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.css';

import Layout from '@atoms/Layout';
import PageHeader from '@organisms/PageHeader';
import Content from '@atoms/Content';
import Col from '@atoms/Col';
import Row from '@atoms/Row';
import PageFooter from '@organisms/PageFooter';
import ActionsPane from '@organisms/ActionsPane';
import NavigatorPane from '@organisms/NavigatorPane';
import FileTreePane from '@organisms/FileTreePane';
import MessageBox from '@organisms/MessageBox';
import SettingsDrawer from '@organisms/SettingsDrawer';
import {Size} from '@models/window';

const StyledColumn = styled(Col)`
  width: 100%;
  height: 100%;
  padding: 0px;
  overflow-y: scroll;
`;

const StyledRow = styled(Row)`
  width: 100%;
  padding: 0px;
  margin: 0px;
  overflow-y: hidden;
`;

const StyledContent = styled(Content)`
  overflow-y: clip;
`;

const App = () => {
  const size: Size = useWindowSize();

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 30 : 30}px`;

  return (
    <div>
      <MessageBox />
      <Layout style={{ height: mainHeight }}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{ height: contentHeight }}>
          <StyledRow style={{ height: contentHeight }}>
            <StyledColumn sm={6}>
              <FileTreePane />
            </StyledColumn>

            <StyledColumn sm={6}>
              <NavigatorPane/>
            </StyledColumn>

            <StyledColumn sm={12}>
              <ActionsPane actionHeight={contentHeight}/>
            </StyledColumn>
          </StyledRow>
        </StyledContent>

        <PageFooter />
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
