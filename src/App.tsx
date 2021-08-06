import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import 'antd/dist/antd.less';
import {Button, Space, Tooltip} from 'antd';
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
  HotKeysHandler,
} from '@organisms';
import {LogViewer, GraphView} from '@molecules';
import {Size} from '@models/window';
import {useWindowSize} from '@utils/hooks';
import {useAppDispatch} from '@redux/hooks';
import {initKubeconfig} from '@redux/reducers/appConfig';
import featureJson from '@src/feature-flags.json';
import ClustersPane from '@organisms/ClustersPane';
import {ClusterExplorerTooltip, FileExplorerTooltip} from '@src/tooltips';
import {TOOLTIP_DELAY} from '@src/constants';

const StyledRow = styled(Row)`
  background-color: ${BackgroundColors.darkThemeBackground};
  width: 100%;
  padding: 0px;
  margin: 0px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;
const StyledColumnLeftMenu = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  border-right: ${AppBorders.pageDivider};
`;
const StyledColumnPanes = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  overflow-x: visible !important;
  overflow-y: visible !important;
`;
const StyledColumnRightMenu = styled(Col)`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 0px;
  margin: 0px;
  border-left: ${AppBorders.pageDivider};
`;

const StyledContent = styled(Content)`
  overflow-y: clip;
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

  const [leftMenuSelection, setLeftMenuSelection] = useState('file-explorer');
  const [rightMenuSelection, setRightMenuSelection] = useState('');
  const [appWidth, setAppWidth] = useState(size.width);
  const [leftActive, setLeftActive] = useState<boolean>(true);
  const [rightActive, setRightActive] = useState<boolean>(false);

  useEffect(() => {
    dispatch(initKubeconfig());
  }, []);

  const toggleLeftMenu = () => {
    setLeftActive(!leftActive);
  };

  const toggleRightMenu = () => {
    if (!featureJson.ShowRightMenu) {
      return;
    }
    setRightActive(!rightActive);
  };

  const setActivePanes = (side: string, selectedMenu: string) => {
    if (side === 'left') {
      if (leftMenuSelection === selectedMenu) {
        toggleLeftMenu();
      } else {
        setLeftMenuSelection(selectedMenu);
        if (!leftActive) {
          setLeftActive(true);
        }
      }
    }

    if (side === 'right' && featureJson.ShowRightMenu) {
      if (rightMenuSelection === selectedMenu) {
        toggleRightMenu();
      } else {
        setRightMenuSelection(selectedMenu);
        if (!rightActive) {
          setRightActive(true);
        }
      }
    }
  };
  if (appWidth !== size.width) setAppWidth(size.width);

  return (
    <div>
      <MessageBox />
      <Layout style={{height: mainHeight}}>
        <PageHeader />
        <SettingsDrawer />

        <StyledContent style={{height: contentHeight}}>
          <StyledRow style={{height: contentHeight + 4}}>
            <StyledColumnLeftMenu>
              <Space direction="vertical" style={{width: 43}}>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FileExplorerTooltip} placement="right">
                  <Button
                    size="large"
                    type="text"
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
                </Tooltip>
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={ClusterExplorerTooltip} placement="right">
                  <Button
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
                </Tooltip>
              </Space>
            </StyledColumnLeftMenu>
            <StyledColumnPanes style={{width: contentWidth}}>
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
                      style={{
                        display: featureJson.ShowGraphView && rightMenuSelection === 'graph' ? 'inline' : 'none',
                      }}
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
            </StyledColumnPanes>
            <StyledColumnRightMenu style={{display: featureJson.ShowRightMenu ? 'inline' : 'none'}}>
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
            </StyledColumnRightMenu>
          </StyledRow>
        </StyledContent>

        <PageFooter />
      </Layout>
      <DiffModal />
      <StartupModal />
      <HotKeysHandler onToggleLeftMenu={() => toggleLeftMenu()} onToggleRightMenu={() => toggleRightMenu()} />
    </div>
  );
};

export default App;
