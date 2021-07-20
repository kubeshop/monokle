import React from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.less';

import {BackgroundColors} from '@styles/Colors';
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
import DiffModal from '@organisms/DiffModal';
import {useWindowSize} from '@utils/hooks';

const StyledColumn = styled(Col)`
  width: 100%;
  height: 100%;
  padding: 0px;
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
  const size: Size = useWindowSize();

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 75 : 75}px`;

  return (
    <div>
      <MessageBox />
      <Layout style={{height: mainHeight}}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{height: contentHeight}}>
          <StyledRow style={{height: contentHeight}}>
            <StyledColumn sm={6}>
              <FileTreePane windowHeight={size.height} />
            </StyledColumn>

            <StyledColumn sm={6}>
              <NavigatorPane />
            </StyledColumn>

            <StyledColumn sm={12}>
              <ActionsPane contentHeight={contentHeight} />
            </StyledColumn>
          </StyledRow>
        </StyledContent>

        <PageFooter />
      </Layout>
      <DiffModal />
    </div>
  );
};

export default App;
