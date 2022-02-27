import {useEffect, useMemo, useState} from 'react';

import {Tooltip} from 'antd';

import {FolderOpenOutlined, FolderOutlined, FormatPainterOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY, TOOLTIP_DELAY} from '@constants/constants';

import {LeftMenuSelectionType} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection, toggleLeftMenu, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector, kustomizationsSelector} from '@redux/selectors';

import {trackEvent} from '@utils/telemetry';

import Colors from '@styles/Colors';

import {HELM_CHART_SECTION_NAME} from '@src/navsections/HelmChartSectionBlueprint';
import {KUSTOMIZATION_SECTION_NAME} from '@src/navsections/KustomizationSectionBlueprint';
import {KUSTOMIZE_PATCH_SECTION_NAME} from '@src/navsections/KustomizePatchSectionBlueprint';

import MenuButton from './MenuButton';
import MenuIcon from './MenuIcon';
import * as S from './PaneManagerLeftMenu.styled';

const PaneManagerLeftMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const helmCharts = useAppSelector(state => Object.values(state.main.helmChartMap));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const kustomizations = useAppSelector(kustomizationsSelector);

  const [hasSeenKustomizations, setHasSeenKustomizations] = useState<boolean>(false);
  const [hasSeenHelmCharts, setHasSeenHelmCharts] = useState<boolean>(false);

  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);
  const rootFileEntry = useMemo(() => fileMap[ROOT_FILE_ENTRY], [fileMap]);

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
      trackEvent('SELECT_LEFT_TOOL_PANEL', {panelID: selectedMenu});
      dispatch(setLeftMenuSelection(selectedMenu));

      if (!leftActive) {
        dispatch(toggleLeftMenu());
      }
    }
  };

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

  return (
    <S.Container id="LeftToolbar">
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
          <S.Badge
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
          </S.Badge>
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
          <S.Badge
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
          </S.Badge>
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
            className={highlightedItems.browseTemplates ? 'animated-highlight' : ''}
            style={highlightedItems.browseTemplates ? {fontSize: '20px', marginLeft: '2px'} : {}}
            icon={FormatPainterOutlined}
            active={Boolean(activeProject) && leftActive}
            isSelected={Boolean(activeProject) && leftMenuSelection === 'templates-pane'}
          />
        </MenuButton>
      </Tooltip>
    </S.Container>
  );
};

export default PaneManagerLeftMenu;
