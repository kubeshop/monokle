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
  StartupModal,
} from '@organisms';
import {LogViewer, GraphView} from '@molecules';
import {Size} from '@models/window';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch} from '@redux/hooks';
import {initKubeconfig} from '@redux/reducers/appConfig';
import featureJson from '@src/feature-flags.json';
import ClustersPane from '@organisms/ClustersPane';
import {useSelector} from 'react-redux';
import {inPreviewMode} from '@redux/selectors';

const StyledReflexContainer = styled(ReflexContainer)`
  &.reflex-container {
    margin-top: 0px;
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
  overflow-x: hidden !important;
  overflow-y: hidden !important;
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

const iconMenuWidth = 45;

const App = () => {
  const dispatch = useAppDispatch();
  const size: Size = useWindowSize();
  const contentWidth = size.width - (featureJson.ShowRightMenu ? 2 : 1) * iconMenuWidth;
  const mainHeight = `${size.height}px`;
  const contentHeight = `${size.height - 75}px`;

  const previewMode = useSelector(inPreviewMode);

  const [leftMenuSelection, setLeftMenuSelection] = useState('');
  const [rightMenuSelection, setRightMenuSelection] = useState('');
  const [rightPaneWidth, setRightPaneWidth] = useState(contentWidth * 0);
  const [navPaneWidth, setNavPaneWidth] = useState(contentWidth * 0.5);
  const [editPaneWidth, setEditPaneWidth] = useState(contentWidth * 0.5);
  const [leftPaneWidth, setLeftPaneWidth] = useState(contentWidth * 0);
  const [appWidth, setAppWidth] = useState(size.width);

  console.log(
    'app.tsx render:',
    'app width',
    size.width,
    'left',
    leftMenuSelection,
    leftPaneWidth,
    'nav',
    navPaneWidth,
    'edit',
    editPaneWidth,
    'right',
    rightPaneWidth
  );

  useEffect(() => {
    dispatch(initKubeconfig());
  }, []);

  const setAspectRatios = (side: string, buttonName: string) => {
    let left;
    let right;
    if (side === 'left') {
      left = leftMenuSelection === buttonName ? '' : buttonName;
      setLeftMenuSelection(left);
    } else left = leftMenuSelection;

    if (side === 'right') {
      right = rightMenuSelection === buttonName ? '' : buttonName;
      setRightMenuSelection(right);
    } else right = rightMenuSelection;

    /*
      Possible configurations (left, right) -> left: 25%, nav: 25%, edit:25%, right:25%
      cc: closed, closed -> left: 0%, nav: 50%, edit:50%, right:0% (default)
      oc: open, closed -> left: 33%, nav: 33%, edit:33%, right:0%
      co: closed, open -> left: 0%, nav: 33%, edit:33%, right:33%
      oo: open, open -> left: 25%, nav: 25%, edit:25%, right:25%
    */
    const cfg =
      left === '' && right === ''
        ? 'cc'
        : left !== '' && right === ''
        ? 'oc'
        : left === '' && right !== ''
        ? 'co'
        : 'oo';

    const leftSize = cfg === 'oc' ? contentWidth * 0.33 : cfg === 'oo' ? contentWidth * 0.25 : 0;
    const rightSize = cfg === 'co' ? contentWidth * 0.33 : cfg === 'oo' ? contentWidth * 0.25 : 0;
    const navEditSizes =
      cfg === 'oc' || cfg === 'co' ? contentWidth * 0.33 : cfg === 'oo' ? contentWidth * 0.25 : contentWidth * 0.5;

    setLeftPaneWidth(leftSize);
    setNavPaneWidth(navEditSizes);
    setEditPaneWidth(navEditSizes);
    setRightPaneWidth(rightSize);
    setAppWidth(size.width);
  };

  if (appWidth !== size.width) setAspectRatios('', '');

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
                    type="text"
                    disabled={previewMode}
                    onClick={() => setAspectRatios('left', 'file-explorer')}
                    icon={
                      <FolderOpenOutlined
                        style={{
                          ...iconStyle,
                          color: leftMenuSelection === 'file-explorer' ? Colors.whitePure : Colors.grey7,
                        }}
                      />
                    }
                  />
                  <Button
                    disabled={previewMode}
                    size="large"
                    type="text"
                    onClick={() => setAspectRatios('left', 'cluster-explorer')}
                    icon={
                      <ClusterOutlined
                        style={{
                          ...iconStyle,
                          color: leftMenuSelection === 'cluster-explorer' ? Colors.whitePure : Colors.grey7,
                        }}
                      />
                    }
                  />
                </Space>
              </StyledMenuLeftReflexElement>

              <StyledReflexElement size={leftPaneWidth} style={{display: leftPaneWidth ? 'inline' : 'none'}}>
                <div style={{display: leftMenuSelection === 'file-explorer' ? 'inline' : 'none'}}>
                  <FileTreePane windowHeight={size.height} />
                </div>
                <div
                  style={{
                    display:
                      featureJson.ShowClusterView && leftMenuSelection === 'cluster-explorer' ? 'inline' : 'none',
                  }}
                >
                  <ClustersPane />
                </div>
              </StyledReflexElement>

              <ReflexSplitter style={{display: leftPaneWidth ? 'inline' : 'none'}} />

              <StyledReflexElement size={navPaneWidth}>
                <NavigatorPane />
              </StyledReflexElement>

              <ReflexSplitter />

              <StyledReflexElement size={editPaneWidth}>
                <ActionsPane contentHeight={contentHeight} />
              </StyledReflexElement>

              <ReflexSplitter style={{display: featureJson.ShowRightMenu && rightPaneWidth ? 'inline' : 'none'}} />

              <StyledReflexElement
                size={rightPaneWidth}
                style={{display: featureJson.ShowRightMenu && rightPaneWidth ? 'inline' : 'none'}}
              >
                <div style={{display: featureJson.ShowGraphView && rightMenuSelection === 'graph' ? 'inline' : 'none'}}>
                  <GraphView editorHeight={contentHeight} />
                </div>
                <div style={{display: rightMenuSelection === 'logs' ? 'inline' : 'none'}}>
                  <LogViewer editorHeight={contentHeight} />
                </div>
              </StyledReflexElement>

              <StyledMenuRightReflexElement size={43} style={{display: featureJson.ShowRightMenu ? 'inline' : 'none'}}>
                <Space direction="vertical">
                  <Button
                    size="large"
                    type="text"
                    onClick={() => setAspectRatios('right', 'graph')}
                    icon={
                      <ApartmentOutlined
                        style={{
                          ...iconStyle,
                          color: rightMenuSelection === 'graph' ? Colors.whitePure : Colors.grey7,
                        }}
                      />
                    }
                    style={{display: featureJson.ShowGraphView ? 'inline' : 'none'}}
                  />

                  <Button
                    size="large"
                    type="text"
                    onClick={() => setAspectRatios('right', 'logs')}
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
      <StartupModal />
    </div>
  );
};

export default App;
