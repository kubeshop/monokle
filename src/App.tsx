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
import {ClusterExplorerTooltip, FileExplorerTooltip} from '@constants/tooltips';
import {TOOLTIP_DELAY} from '@constants/constants';

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

const MenuIcon = (props: {
  icon: React.ElementType;
  active: boolean;
  isSelected: boolean;
  style?: React.CSSProperties;
}) => {
  const {icon: IconComponent, active, isSelected, style: customStyle = {}} = props;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const style = {
    ...customStyle,
    fontSize: 25,
    color: Colors.grey7,
  };

  if (isHovered || (active && isSelected)) {
    style.color = Colors.grey400;
  }

  return (
    <IconComponent style={style} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />
  );
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
                      <MenuIcon
                        style={{marginLeft: 4}}
                        icon={FolderOpenOutlined}
                        active={leftActive}
                        isSelected={leftMenuSelection === 'file-explorer'}
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
                      <MenuIcon
                        icon={ClusterOutlined}
                        active={leftActive}
                        isSelected={leftMenuSelection === 'cluster-explorer'}
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
                nav={<NavigatorPane windowHeight={size.height} />}
                editor={<ActionsPane contentHeight={contentHeight} />}
                right={
                  <>
                    {featureJson.ShowGraphView && rightMenuSelection === 'graph' ? (
                      <GraphView editorHeight={contentHeight} />
                    ) : undefined}
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
                    <MenuIcon
                      icon={ApartmentOutlined}
                      active={rightActive}
                      isSelected={rightMenuSelection === 'graph'}
                    />
                  }
                  style={{display: featureJson.ShowGraphView ? 'inline' : 'none'}}
                />

                <Button
                  size="large"
                  type="text"
                  onClick={() => setActivePanes('right', 'logs')}
                  icon={
                    <MenuIcon icon={CodeOutlined} active={rightActive} isSelected={rightMenuSelection === 'logs'} />
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
