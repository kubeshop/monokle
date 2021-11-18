import {Badge, Button, Space, Tooltip} from 'antd';
import React, {useContext, useMemo, useState} from 'react';
import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  closeClusterDiff,
  openClusterDiff,
  setLeftMenuSelection,
  setRightMenuSelection,
  toggleLeftMenu,
  toggleRightMenu,
} from '@redux/reducers/ui';
import {onUserPerformedClickOnClusterIcon} from '@redux/reducers/uiCoach';

import {ActionsPane, ClustersPane, FileTreePane, NavigatorPane, PluginManagerPane} from '@organisms';

import {GraphView, LogViewer} from '@molecules';

import {Col, Content, Row, SplitView} from '@atoms';

import {
  ApartmentOutlined,
  ApiOutlined,
  ClusterOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  WarningFilled,
} from '@ant-design/icons';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {ClusterExplorerTooltips, FileExplorerTooltip, PluginManagerTooltip} from '@constants/tooltips';

import electronStore from '@utils/electronStore';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

import AppContext from '@src/AppContext';
import featureJson from '@src/feature-flags.json';

import 'antd/dist/antd.less';

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
  overflow-y: visible;
`;

const MenuIcon = (props: {
  icon: React.ElementType;
  active: boolean;
  isSelected: boolean;
  style?: React.CSSProperties;
}) => {
  const {icon: IconComponent, active, isSelected, style: customStyle = {}} = props;
  const {color = Colors.grey7} = customStyle;

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const style = {
    fontSize: 25,
    color,
    ...customStyle,
  };

  if (isHovered || (active && isSelected)) {
    style.color = Colors.grey400;
  }

  return (
    <IconComponent style={style} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} />
  );
};

const iconMenuWidth = 45;

const PaneManager = () => {
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);

  const contentWidth = windowSize.width - (featureJson.ShowRightMenu ? 2 : 1) * iconMenuWidth;
  const contentHeight = `${windowSize.height - 75}px`;

  const fileMap = useAppSelector(state => state.main.fileMap);
  const wasRehydrated = useAppSelector(state => state.main.wasRehydrated);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const rightMenuSelection = useAppSelector(state => state.ui.rightMenu.selection);
  const rightActive = useAppSelector(state => state.ui.rightMenu.isActive);
  const isClusterDiffVisible = useAppSelector(state => state.ui.isClusterDiffVisible);
  const kubeconfigPath = useAppSelector(state => state.config.kubeconfigPath);
  const isKubeconfigPathValid = useAppSelector(state => state.config.isKubeconfigPathValid);
  const hasUserPerformedClickOnClusterIcon = useAppSelector(state => state.uiCoach.hasUserPerformedClickOnClusterIcon);

  const isFolderOpen = useMemo(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const setActivePanes = (side: string, selectedMenu: string) => {
    if (side === 'left') {
      dispatch(closeClusterDiff());
      if (leftMenuSelection === selectedMenu) {
        dispatch(toggleLeftMenu());
      } else {
        dispatch(setLeftMenuSelection(selectedMenu));
        if (!leftActive) {
          dispatch(toggleLeftMenu());
        }
      }
    }

    if (side === 'right' && featureJson.ShowRightMenu) {
      if (rightMenuSelection === selectedMenu) {
        dispatch(toggleRightMenu());
      } else {
        dispatch(setRightMenuSelection(selectedMenu));
        if (!rightActive) {
          dispatch(toggleRightMenu());
        }
      }
    }
  };

  const getBadgeChild = () => {
    if (!wasRehydrated) {
      return;
    }

    if (!hasUserPerformedClickOnClusterIcon) {
      return {dot: true};
    }

    if (!kubeconfigPath || !isKubeconfigPathValid) {
      const color = !isKubeconfigPathValid ? Colors.redError : Colors.yellowWarning;

      return {
        count: (
          <WarningFilled
            style={{
              color,
            }}
          />
        ),
      };
    }

    return {count: 0}; // Badge is not shown if count is 0;
  };

  const badgeChild = getBadgeChild();

  const getClusterExplorerTooltipText = () => {
    if (!wasRehydrated) {
      return;
    }

    if (!hasUserPerformedClickOnClusterIcon) {
      return ClusterExplorerTooltips.firstTimeSeeing;
    }

    if (!kubeconfigPath) {
      return ClusterExplorerTooltips.noKubeconfigPath;
    }

    if (!isKubeconfigPathValid) {
      return ClusterExplorerTooltips.notValidKubeconfigPath;
    }

    return ClusterExplorerTooltips.default;
  };

  const clusterExplorerTooltipText = getClusterExplorerTooltipText();

  const openClusterDiffDrawer = () => {
    dispatch(openClusterDiff());
  };

  return (
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
                    icon={isFolderOpen ? FolderOpenOutlined : FolderOutlined}
                    active={leftActive}
                    isSelected={leftMenuSelection === 'file-explorer'}
                  />
                }
              />
            </Tooltip>
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={clusterExplorerTooltipText} placement="right">
              <Button
                size="large"
                type="text"
                onClick={async () => {
                  setActivePanes('left', 'cluster-explorer');

                  electronStore.set('appConfig.hasUserPerformedClickOnClusterIcon', true);

                  if (!hasUserPerformedClickOnClusterIcon) {
                    dispatch(onUserPerformedClickOnClusterIcon());
                  }
                }}
                icon={
                  <Badge {...badgeChild} color={Colors.blue6}>
                    <MenuIcon
                      icon={ClusterOutlined}
                      active={leftActive}
                      isSelected={leftMenuSelection === 'cluster-explorer'}
                    />
                  </Badge>
                }
              />
            </Tooltip>
            {featureJson.PluginManager && (
              <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={PluginManagerTooltip} placement="right">
                <Button
                  size="large"
                  type="text"
                  onClick={() => setActivePanes('left', 'plugin-manager')}
                  icon={
                    <MenuIcon
                      icon={ApiOutlined}
                      active={leftActive}
                      isSelected={leftMenuSelection === 'plugin-manager'}
                    />
                  }
                />
              </Tooltip>
            )}
          </Space>
        </StyledColumnLeftMenu>

        <StyledColumnPanes style={{width: contentWidth}}>
          <SplitView
            contentWidth={contentWidth}
            left={
              <>
                <div style={{display: leftMenuSelection === 'file-explorer' ? 'inline' : 'none'}}>
                  <FileTreePane />
                </div>
                <div
                  style={{
                    display:
                      featureJson.ShowClusterView && leftMenuSelection === 'cluster-explorer' ? 'inline' : 'none',
                  }}
                >
                  <ClustersPane />
                </div>
                <div
                  style={{
                    display: featureJson.PluginManager && leftMenuSelection === 'plugin-manager' ? 'inline' : 'none',
                  }}
                >
                  <PluginManagerPane />
                </div>
              </>
            }
            hideLeft={!leftActive}
            nav={<NavigatorPane />}
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
                <MenuIcon icon={ApartmentOutlined} active={rightActive} isSelected={rightMenuSelection === 'graph'} />
              }
              style={{display: featureJson.ShowGraphView ? 'inline' : 'none'}}
            />

            <Button
              size="large"
              type="text"
              onClick={() => setActivePanes('right', 'logs')}
              icon={<MenuIcon icon={CodeOutlined} active={rightActive} isSelected={rightMenuSelection === 'logs'} />}
            />
          </Space>
        </StyledColumnRightMenu>
      </StyledRow>
    </StyledContent>
  );
};

export default PaneManager;
