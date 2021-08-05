import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.less';
import {Button, Space} from 'antd';
import {ClusterOutlined, FolderOpenOutlined, ApartmentOutlined, CodeOutlined} from '@ant-design/icons';
import Colors, {BackgroundColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';
import {Layout, Row, Col, Content, SplitView} from '@atoms';
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

const StyledRow = styled(Row)`
  background-color: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  padding: 0px;
  margin: 0px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;
const StyledColumnLeft = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  border-right: ${AppBorders.pageDivider};
`;
const StyledColumnNavEdit = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  overflow-x: hidden !important;
  overflow-y: hidden !important;
`;
const StyledColumnRight = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  border-left: ${AppBorders.pageDivider};
`;

const StyledContent = styled(Content)`
  overflow-y: clip;

  .ant-btn:hover,
  .ant-btn:focus {
    color: #165996;
    background: transparent;
    border-color: #165996;
  }
  .ant-row {
    display: flex;
    flex-flow: row nowrap;
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
  const [appWidth, setAppWidth] = useState(size.width);

  useEffect(() => {
    dispatch(initKubeconfig());
  }, []);

  const setActivePanes = (side: string, buttonName: string) => {
    let left;
    let right;
    if (side === 'left') {
      left = leftMenuSelection === buttonName ? '' : buttonName;
      setLeftMenuSelection(left);
    }

    if (side === 'right') {
      right = rightMenuSelection === buttonName ? '' : buttonName;
      setRightMenuSelection(right);
    }
  };

  if (appWidth !== size.width) setAppWidth(size.width);

  const leftActive = leftMenuSelection !== '';
  const rightActive = featureJson.ShowRightMenu && rightMenuSelection !== '';

  return (
    <div>
      <MessageBox />
      <Layout style={{height: mainHeight}}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{height: contentHeight}}>
          <StyledRow style={{height: contentHeight + 4}}>
            <StyledColumnLeft>
              <Space direction="vertical" style={{width: 43}}>
                <Button
                  size="large"
                  type="text"
                  disabled={previewMode}
                  onClick={() => setActivePanes('left', 'file-explorer')}
                  icon={
                    <FolderOpenOutlined
                      style={{
                        ...iconStyle,
                        color: leftMenuSelection === 'file-explorer' ? Colors.whitePure : Colors.grey7,
                        marginLeft: 4,
                      }}
                    />
                  }
                />
                <Button
                  disabled={previewMode}
                  size="large"
                  type="text"
                  onClick={() => setActivePanes('left', 'cluster-explorer')}
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
            </StyledColumnLeft>
            <StyledColumnNavEdit style={{width: contentWidth}}>
              <SplitView
                contentWidth={contentWidth}
                left={
                  <>
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
                  </>
                }
                hideLeft={!leftActive}
                nav={<NavigatorPane />}
                editor={<ActionsPane contentHeight={contentHeight} />}
                right={
                  <>
                    <div
                      style={{display: featureJson.ShowGraphView && rightMenuSelection === 'graph' ? 'inline' : 'none'}}
                    >
                      <GraphView editorHeight={contentHeight} />
                    </div>
                    <div style={{display: rightMenuSelection === 'logs' ? 'inline' : 'none'}}>
                      <LogViewer editorHeight={contentHeight} />
                    </div>
                  </>
                }
                hideRight={!rightActive}
              />
            </StyledColumnNavEdit>
            <StyledColumnRight style={{display: featureJson.ShowRightMenu ? 'inline' : 'none'}}>
              <Space direction="vertical" style={{width: 43}}>
                <Button
                  size="large"
                  type="text"
                  onClick={() => setActivePanes('right', 'graph')}
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
                  onClick={() => setActivePanes('right', 'logs')}
                  icon={
                    <CodeOutlined
                      style={{...iconStyle, color: rightMenuSelection === 'logs' ? Colors.whitePure : Colors.grey7}}
                    />
                  }
                />
              </Space>
            </StyledColumnRight>
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
