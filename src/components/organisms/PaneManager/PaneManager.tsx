import React, {useContext, useMemo} from 'react';

import {Button, Space, Tooltip} from 'antd';
import 'antd/dist/antd.less';

import {
  ApartmentOutlined,
  ApiOutlined,
  CodeOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  FormatPainterOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';
import {FileExplorerTooltip, PluginManagerTooltip} from '@constants/tooltips';

import {LeftMenuSelection} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection, setRightMenuSelection, toggleLeftMenu, toggleRightMenu} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import {
  ActionsPane,
  FileTreePane,
  HelmPane,
  KustomizePane,
  NavigatorPane,
  PluginManagerPane,
  TemplateExplorerPane,
} from '@organisms';

import {GraphView} from '@molecules';

import {Col, SplitView} from '@atoms';

import {AppBorders} from '@styles/Borders';
import {BackgroundColors} from '@styles/Colors';

import AppContext from '@src/AppContext';
import featureJson from '@src/feature-flags.json';
import {HELM_CHART_SECTION_NAME} from '@src/navsections/HelmChartSectionBlueprint';
import {KUSTOMIZATION_SECTION_NAME} from '@src/navsections/KustomizationSectionBlueprint';
import {KUSTOMIZE_PATCH_SECTION_NAME} from '@src/navsections/KustomizePatchSectionBlueprint';

import MenuButton from './MenuButton';
import MenuIcon from './MenuIcon';

const StyledRow = styled.div`
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

const iconMenuWidth = 45;

const PaneManager = () => {
  const dispatch = useAppDispatch();
  const {windowSize} = useContext(AppContext);

  const contentWidth = windowSize.width - (featureJson.ShowRightMenu ? 2 : 1) * iconMenuWidth;

  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const rightMenuSelection = useAppSelector(state => state.ui.rightMenu.selection);
  const rightActive = useAppSelector(state => state.ui.rightMenu.isActive);

  // TODO: refactor this to get the size of the page header dinamically
  const contentHeight = useMemo(() => {
    return isInPreviewMode ? `${windowSize.height - 100}px` : `${windowSize.height - 75}px`;
  }, [isInPreviewMode, windowSize.height]);

  const isFolderOpen = useMemo(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const setLeftActiveMenu = (selectedMenu: LeftMenuSelection) => {
    if (leftMenuSelection === selectedMenu) {
      dispatch(toggleLeftMenu());
    } else {
      dispatch(setLeftMenuSelection(selectedMenu));
      if (!leftActive) {
        dispatch(toggleLeftMenu());
      }
    }
  };

  const setRightActiveMenu = (selectedMenu: string) => {
    if (featureJson.ShowRightMenu) {
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

  return (
    <StyledRow style={{height: contentHeight}}>
      <StyledColumnLeftMenu>
        <Space direction="vertical" style={{width: 43}}>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FileExplorerTooltip} placement="right">
            <MenuButton
              isSelected={leftMenuSelection === 'file-explorer'}
              isActive={leftActive}
              shouldWatchSelectedPath
              onClick={() => setLeftActiveMenu('file-explorer')}
            >
              <MenuIcon
                style={{marginLeft: 4}}
                icon={isFolderOpen ? FolderOpenOutlined : FolderOutlined}
                active={leftActive}
                isSelected={leftMenuSelection === 'file-explorer'}
              />
            </MenuButton>
          </Tooltip>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Kustomizations" placement="right">
            <MenuButton
              isSelected={leftMenuSelection === 'kustomize-pane'}
              isActive={leftActive}
              onClick={() => setLeftActiveMenu('kustomize-pane')}
              sectionNames={[KUSTOMIZATION_SECTION_NAME, KUSTOMIZE_PATCH_SECTION_NAME]}
            >
              <MenuIcon iconName="kustomize" active={leftActive} isSelected={leftMenuSelection === 'kustomize-pane'} />
            </MenuButton>
          </Tooltip>
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Helm Charts" placement="right">
            <MenuButton
              isSelected={leftMenuSelection === 'helm-pane'}
              isActive={leftActive}
              onClick={() => setLeftActiveMenu('helm-pane')}
              sectionNames={[HELM_CHART_SECTION_NAME]}
            >
              <MenuIcon iconName="helm" active={leftActive} isSelected={leftMenuSelection === 'helm-pane'} />
            </MenuButton>
          </Tooltip>
          {featureJson.TemplateExplorerPane && (
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={PluginManagerTooltip} placement="right">
              <MenuButton
                isSelected={leftMenuSelection === 'templates-pane'}
                isActive={leftActive}
                onClick={() => setLeftActiveMenu('templates-pane')}
              >
                <MenuIcon
                  icon={FormatPainterOutlined}
                  active={leftActive}
                  isSelected={leftMenuSelection === 'templates-pane'}
                />
              </MenuButton>
            </Tooltip>
          )}
          {featureJson.PluginManager && (
            <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={PluginManagerTooltip} placement="right">
              <MenuButton
                isSelected={leftMenuSelection === 'plugin-manager'}
                isActive={leftActive}
                onClick={() => setLeftActiveMenu('plugin-manager')}
              >
                <MenuIcon icon={ApiOutlined} active={leftActive} isSelected={leftMenuSelection === 'plugin-manager'} />
              </MenuButton>
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
              <div style={{display: leftMenuSelection === 'kustomize-pane' ? 'inline' : 'none'}}>
                <KustomizePane />
              </div>
              <div style={{display: leftMenuSelection === 'helm-pane' ? 'inline' : 'none'}}>
                <HelmPane />
              </div>
              <div
                style={{
                  display:
                    featureJson.TemplateExplorerPane && leftMenuSelection === 'templates-pane' ? 'inline' : 'none',
                }}
              >
                <TemplateExplorerPane />
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
            onClick={() => setRightActiveMenu('graph')}
            icon={
              <MenuIcon icon={ApartmentOutlined} active={rightActive} isSelected={rightMenuSelection === 'graph'} />
            }
            style={{display: featureJson.ShowGraphView ? 'inline' : 'none'}}
          />

          <Button
            size="large"
            type="text"
            onClick={() => setRightActiveMenu('logs')}
            icon={<MenuIcon icon={CodeOutlined} active={rightActive} isSelected={rightMenuSelection === 'logs'} />}
          />
        </Space>
      </StyledColumnRightMenu>
    </StyledRow>
  );
};

export default PaneManager;
