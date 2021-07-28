import React, {useEffect} from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.less';
import SplitPane from 'react-split-pane';

import {BackgroundColors} from '@styles/Colors';
import Layout from '@atoms/Layout';
import PageHeader from '@organisms/PageHeader';
import Content from '@atoms/Content';
import Row from '@atoms/Row';
import PageFooter from '@organisms/PageFooter';
import ActionsPane from '@organisms/ActionsPane';
import NavigatorPane from '@organisms/NavigatorPane';
import FileTreePane from '@organisms/FileTreePane';
import MessageBox from '@organisms/MessageBox';
import SettingsDrawer from '@organisms/SettingsDrawer';
import {Size} from '@models/window';
import DiffModal from '@organisms/DiffModal';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch} from '@redux/hooks';
import {initKubeconfig} from '@redux/reducers/appConfig';

const Pane = styled.div`
  height: 100%;
  border-right: 1px solid #fff;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const StyledRow = styled(Row)`
  background-color: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  padding: 0px;
  margin: 0px;
  overflow-y: hidden;
`;

const StyledContent = styled(Content)`
  overflow-y: clip;
`;

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 75 : 75}px`;

  useEffect(() => {
    dispatch(initKubeconfig());
  }, []);

  return (
    <div>
      <MessageBox />
      <Layout style={{height: mainHeight}}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{height: contentHeight}}>
          <StyledRow style={{height: contentHeight}}>
            <SplitPane defaultSize="50%" split="vertical">
              <Pane>
                <FileTreePane windowHeight={size.height} />
              </Pane>
              <Pane>
                <NavigatorPane />
              </Pane>
              <Pane>
                <ActionsPane contentHeight={contentHeight} />
              </Pane>
            </SplitPane>
          </StyledRow>
        </StyledContent>

        <PageFooter />
      </Layout>
      <DiffModal />
    </div>
  );
};

export default App;
