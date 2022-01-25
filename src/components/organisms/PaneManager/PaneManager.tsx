import {useContext, useEffect, useMemo, useState} from 'react';

import {Badge, Button, Skeleton, Space, Tooltip} from 'antd';
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

import {LeftMenuSelectionType} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setLeftMenuSelection,
  setRightMenuSelection,
  toggleLeftMenu,
  toggleRightMenu,
  toggleStartProjectPane,
} from '@redux/reducers/ui';
import {activeProjectSelector, isInPreviewModeSelector, kustomizationsSelector} from '@redux/selectors';

import {
  ActionsPane,
  FileTreePane,
  HelmPane,
  KustomizePane,
  NavigatorPane,
  PluginManagerPane,
  TemplateManagerPane,
} from '@organisms';

import {GraphView} from '@molecules';

import {Col, SplitView} from '@atoms';

import {AppBorders} from '@styles/Borders';
import Colors, {BackgroundColors} from '@styles/Colors';

import AppContext from '@src/AppContext';
import featureJson from '@src/feature-flags.json';
import {HELM_CHART_SECTION_NAME} from '@src/navsections/HelmChartSectionBlueprint';
import {KUSTOMIZATION_SECTION_NAME} from '@src/navsections/KustomizationSectionBlueprint';
import {KUSTOMIZE_PATCH_SECTION_NAME} from '@src/navsections/KustomizePatchSectionBlueprint';

import RecentProjectsPane from '../RecentProjectsPane';
import StartProjectPane from '../StartProjectPane';
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

const StyledSkeleton = styled(Skeleton)`
  padding: 8px 16px;
`;

const iconMenuWidth = 45;

const PaneManager = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isProjectLoading = useAppSelector(state => state.config.isProjectLoading);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const rightActive = useAppSelector(state => state.ui.rightMenu.isActive);
  const rightMenuSelection = useAppSelector(state => state.ui.rightMenu.selection);

  const {windowSize} = useContext(AppContext);

  const contentWidth = windowSize.width - (featureJson.ShowRightMenu ? 2 : 1) * iconMenuWidth;
  const kustomizations = useAppSelector(kustomizationsSelector);
  const helmCharts = useAppSelector(state => Object.values(state.main.helmChartMap));

  const rootFileEntry = useMemo(() => fileMap[ROOT_FILE_ENTRY], [fileMap]);

  const [hasSeenKustomizations, setHasSeenKustomizations] = useState<boolean>(false);
  const [hasSeenHelmCharts, setHasSeenHelmCharts] = useState<boolean>(false);

  useEffect(() => {
    if (leftActive && leftMenuSelection === 'kustomize-pane') {
      setHasSeenKustomizations(true);
    }
    if (leftActive && leftMenuSelection === 'helm-pane') {
      setHasSeenHelmCharts(true);
    }
  }, [leftActive, leftMenuSelection]);

  useEffect(() => {
    setHasSeenKustomizations(false);
    setHasSeenHelmCharts(false);
  }, [rootFileEntry]);

  // TODO: refactor this to get the size of the page header dynamically
  const contentHeight = useMemo(() => {
    return isInPreviewMode ? `${windowSize.height - 100}px` : `${windowSize.height - 75}px`;
  }, [isInPreviewMode, windowSize.height]);

  const isFolderOpen = useMemo(() => {
    return Boolean(fileMap[ROOT_FILE_ENTRY]);
  }, [fileMap]);

  const setLeftActiveMenu = (selectedMenu: LeftMenuSelectionType) => {
    if (leftMenuSelection === selectedMenu) {
      if (isStartProjectPaneVisible) {
        dispatch(toggleStartProjectPane());
      } else {
        dispatch(toggleLeftMenu());
      }
    } else {
      if (isStartProjectPaneVisible) {
        dispatch(toggleStartProjectPane());
      }
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

  let content;
  if (isProjectLoading) {
    content = <StyledSkeleton />;
  } else if (!isStartProjectPaneVisible) {
    content = (
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
                  display: leftMenuSelection === 'templates-pane' ? 'inline' : 'none',
                }}
              >
                <TemplateManagerPane />
              </div>
              <div
                style={{
                  display: leftMenuSelection === 'plugin-manager' ? 'inline' : 'none',
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
    );
  } else {
    content = (
      <StyledColumnPanes style={{width: contentWidth}}>
        <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
          {leftMenuSelection === 'plugin-manager' && leftActive && (
            <div style={{borderRight: `1px solid ${Colors.grey3}`}}>
              <PluginManagerPane />
            </div>
          )}
          <div style={{flex: 3}}>
            <StartProjectPane />
          </div>
          <div style={{flex: 1, borderLeft: `1px solid ${Colors.grey3}`}}>
            <RecentProjectsPane />
          </div>
        </div>
      </StyledColumnPanes>
    );
  }

  return (
    <StyledRow style={{height: contentHeight}}>
      <StyledColumnLeftMenu>
        <Space direction="vertical" style={{width: 43}}>
          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title={leftMenuSelection === 'file-explorer' && leftActive ? 'Hide File Explorer' : 'View File Explorer'}
            placement="right"
          >
            <MenuButton
              isSelected={leftMenuSelection === 'file-explorer'}
              isActive={Boolean(activeProject) && leftActive}
              shouldWatchSelectedPath
              onClick={() => setLeftActiveMenu('file-explorer')}
              disabled={!activeProject}
            >
              <MenuIcon
                style={{marginLeft: 4}}
                icon={isFolderOpen ? FolderOpenOutlined : FolderOutlined}
                active={Boolean(activeProject) && leftActive}
                isSelected={Boolean(activeProject) && leftMenuSelection === 'file-explorer'}
              />
            </MenuButton>
          </Tooltip>
          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title={leftMenuSelection === 'kustomize-pane' && leftActive ? 'Hide Kustomizations' : 'View Kustomizations'}
            placement="right"
          >
            <MenuButton
              isSelected={Boolean(activeProject) && leftMenuSelection === 'kustomize-pane'}
              isActive={Boolean(activeProject) && leftActive}
              onClick={() => setLeftActiveMenu('kustomize-pane')}
              sectionNames={[KUSTOMIZATION_SECTION_NAME, KUSTOMIZE_PATCH_SECTION_NAME]}
              disabled={!activeProject}
            >
              <Badge
                count={!hasSeenKustomizations && kustomizations.length ? kustomizations.length : 0}
                color={Colors.blue6}
                size="default"
                dot
              >
                <MenuIcon
                  iconName="kustomize"
                  active={Boolean(activeProject) && leftActive}
                  isSelected={Boolean(activeProject) && leftMenuSelection === 'kustomize-pane'}
                />
              </Badge>
            </MenuButton>
          </Tooltip>
          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title={leftMenuSelection === 'helm-pane' && leftActive ? 'Hide Helm Charts' : 'View Helm Charts'}
            placement="right"
          >
            <MenuButton
              isSelected={Boolean(activeProject) && leftMenuSelection === 'helm-pane'}
              isActive={Boolean(activeProject) && leftActive}
              onClick={() => setLeftActiveMenu('helm-pane')}
              sectionNames={[HELM_CHART_SECTION_NAME]}
              disabled={!activeProject}
            >
              <Badge
                count={!hasSeenHelmCharts && helmCharts.length ? helmCharts.length : 0}
                color={Colors.blue6}
                size="default"
                dot
              >
                <MenuIcon
                  iconName="helm"
                  active={Boolean(activeProject) && leftActive}
                  isSelected={Boolean(activeProject) && leftMenuSelection === 'helm-pane'}
                />
              </Badge>
            </MenuButton>
          </Tooltip>

          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title={leftMenuSelection === 'templates-pane' && leftActive ? 'Hide Templates' : 'View Templates'}
            placement="right"
          >
            <MenuButton
              isSelected={Boolean(activeProject) && leftMenuSelection === 'templates-pane'}
              isActive={Boolean(activeProject) && leftActive}
              onClick={() => setLeftActiveMenu('templates-pane')}
              disabled={!activeProject}
            >
              <MenuIcon
                icon={FormatPainterOutlined}
                active={Boolean(activeProject) && leftActive}
                isSelected={Boolean(activeProject) && leftMenuSelection === 'templates-pane'}
              />
            </MenuButton>
          </Tooltip>

          <Tooltip
            mouseEnterDelay={TOOLTIP_DELAY}
            title={leftMenuSelection === 'plugin-manager' && leftActive ? 'Hide Plugins' : 'View Plugins'}
            placement="right"
          >
            <MenuButton
              isSelected={leftMenuSelection === 'plugin-manager'}
              isActive={leftActive}
              onClick={() => setLeftActiveMenu('plugin-manager')}
            >
              <MenuIcon icon={ApiOutlined} active={leftActive} isSelected={leftMenuSelection === 'plugin-manager'} />
            </MenuButton>
          </Tooltip>
        </Space>
      </StyledColumnLeftMenu>

      {content}

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
