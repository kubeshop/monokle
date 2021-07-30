import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.less';
import {Button, Space} from 'antd';
import {ClusterOutlined, FolderOpenOutlined, ApartmentOutlined, CodeOutlined} from '@ant-design/icons';
import 'react-reflex/styles.css';
import {ReflexContainer, ReflexSplitter, ReflexElement} from 'react-reflex';

import Colors, {BackgroundColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';
import {Layout, Row, Content} from '@atoms';
import {
  PageHeader,
  PageFooter,
  ActionsPane,
  NavigatorPane,
  FileTreePane,
  MessageBox,
  SettingsDrawer,
  DiffModal,
} from '@organisms';
import {LogViewer, GraphView} from '@molecules';
import {Size} from '@models/window';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch} from '@redux/hooks';
import {initKubeconfig} from '@redux/reducers/appConfig';
import featureJson from '@src/feature-flags.json';

const StyledReflexContainer = styled(ReflexContainer)`
  &.reflex-container {
    margin-top: 0px;
  }
  .ant-btn {
    line-height: 1.5715;
    position: relative;
    display: inline-block;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    border: 1px solid transparent;
    box-shadow: 0 2px 0 rgb(0 0 0 / 2%);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    touch-action: manipulation;
    height: 40px;
    padding: 8px;
    font-size: 14px;
    border-radius: 2px;
    color: rgba(255, 255, 255, 0.85);
    background: transparent;
  }
  .ant-btn:hover,
  .ant-btn:focus {
    color: #165996;
    background: transparent;
    border-color: #165996;
  }
`;

const StyledReflexElement = styled(ReflexElement)`
  height: 100%;
  border-left: ${AppBorders.pageDivider};
  border-right: ${AppBorders.pageDivider};
  overflow-x: hidden;
  overflow-y: hidden;
`;

const StyledMenuLeftReflexElement = styled(ReflexElement)`
  &.reflex-element {
    margin: 3px;
  }
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
`;

const StyledMenuRightReflexElement = styled(ReflexElement)`
  &.reflex-element {
    margin: 3px;
  }
  height: 100%;
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
  .reflex-container > .reflex-splitter {
    background-color: ${Colors.grey3};
    z-index: 100;
  }
  .reflex-container.vertical > .reflex-splitter {
    border-right: 1px solid ${Colors.grey3};
    border-left: 1px solid ${Colors.grey3};
    cursor: col-resize;
    height: 100%;
    width: 1px;
  }
`;

const iconStyle = {
  fontSize: 25,
};

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();

  const [leftMenuSelection, setLeftMenuSelection] = useState('');
  const [rightMenuSelection, setRightMenuSelection] = useState('');
  const [rightPaneWidth, setRightPaneWidth] = useState('0%');
  const [navPaneWidth, setNavPaneWidth] = useState('50%');
  const [editPaneWidth, setEditPaneWidth] = useState('50%');
  const [leftPaneWidth, setLeftPaneWidth] = useState('0%');

  const mainHeight = `${size.height ? size.height : 100}px`;
  const contentHeight = `${size.height ? size.height - 75 : 75}px`;

  useEffect(() => {
    dispatch(initKubeconfig());
  }, []);

  const setAspectRatios = () => {
    /*
      Possible configurations (left, right) -> left: 25%, nav: 25%, edit:25%, right:25%
      closed, closed -> left: 0%, nav: 50%, edit:50%, right:0% (default)
      open, closed -> left: 33%, nav: 33%, edit:33%, right:0%
      closed, open -> left: 0%, nav: 33%, edit:33%, right:33%
      open, open -> left: 25%, nav: 25%, edit:25%, right:25%
    */
  };

  return (
    <div>
      <MessageBox />
      <Layout style={{height: mainHeight}}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{height: contentHeight}}>
          <StyledRow style={{height: contentHeight + 4}}>
            <StyledReflexContainer orientation="vertical" windowResizeAware>
              <StyledMenuLeftReflexElement size={43}>
                <Space direction="vertical">
                  <Button
                    size="large"
                    onClick={() => setLeftMenuSelection(leftMenuSelection === 'file-explorer' ? '' : 'file-explorer')}
                    icon={
                      <FolderOpenOutlined
                        style={{
                          ...iconStyle,
                          color: leftMenuSelection === 'file-explorer' ? Colors.whitePure : Colors.grey7,
                        }}
                      />
                    }
                  />
                  {featureJson.ShowGraphView && (
                    <Button
                      size="large"
                      onClick={() =>
                        setLeftMenuSelection(leftMenuSelection === 'cluster-explorer' ? '' : 'cluster-explorer')
                      }
                      icon={
                        <ClusterOutlined
                          style={{
                            ...iconStyle,
                            color: leftMenuSelection === 'cluster-explorer' ? Colors.whitePure : Colors.grey7,
                          }}
                        />
                      }
                    />
                  )}
                </Space>
              </StyledMenuLeftReflexElement>
              <StyledReflexElement
                minSize={leftMenuSelection !== '' ? 400 : 0}
                maxSize={leftMenuSelection !== '' ? 1000 : 0}
                size={leftMenuSelection === '' ? 0 : 600}
              >
                {leftMenuSelection === 'file-explorer' ? <FileTreePane windowHeight={size.height} /> : undefined}
                {featureJson.ShowClusterView && leftMenuSelection === 'cluster-explorer' ? (
                  <div>cluster buster</div>
                ) : undefined}
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement minSize={200} maxSize={1000}>
                <NavigatorPane />
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement minSize={200} maxSize={1000}>
                <ActionsPane contentHeight={contentHeight} />
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement
                minSize={rightMenuSelection !== '' ? 200 : 0}
                maxSize={rightMenuSelection !== '' ? 1000 : 0}
                size={rightMenuSelection === '' ? 0 : 600}
              >
                {featureJson.ShowGraphView && rightMenuSelection === 'graph' ? (
                  <GraphView editorHeight={contentHeight} />
                ) : undefined}
                {rightMenuSelection === 'logs' ? <LogViewer editorHeight={contentHeight} /> : undefined}
              </StyledReflexElement>

              <StyledMenuRightReflexElement size={43}>
                <Space direction="vertical">
                  {featureJson.ShowGraphView && (
                    <Button
                      size="large"
                      onClick={() => setRightMenuSelection(rightMenuSelection === 'graph' ? '' : 'graph')}
                      icon={
                        <ApartmentOutlined
                          style={{
                            ...iconStyle,
                            color: rightMenuSelection === 'graph' ? Colors.whitePure : Colors.grey7,
                          }}
                        />
                      }
                    />
                  )}

                  <Button
                    size="large"
                    onClick={() => setRightMenuSelection(rightMenuSelection === 'logs' ? '' : 'logs')}
                    icon={
                      <CodeOutlined
                        style={{...iconStyle, color: rightMenuSelection === 'logs' ? Colors.whitePure : Colors.grey7}}
                      />
                    }
                  />
                </Space>
              </StyledMenuRightReflexElement>
            </StyledReflexContainer>
          </StyledRow>
        </StyledContent>

        <PageFooter />
      </Layout>
      <DiffModal />
    </div>
  );
};

export default App;
