import {useEffect, useMemo, useState} from 'react';

import {FolderOpenOutlined, FolderOutlined, FormatPainterOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {LeftMenuSelectionType} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection, toggleLeftMenu, toggleValidationDrawer} from '@redux/reducers/ui';
import {activeProjectSelector, kustomizationsSelector} from '@redux/selectors';

import WalkThrough from '@components/molecules/WalkThrough';

import {SELECT_LEFT_TOOL_PANEL, trackEvent} from '@utils/telemetry';

import Colors from '@styles/Colors';

import featureJson from '@src/feature-flags.json';
import {HELM_CHART_SECTION_NAME} from '@src/navsections/HelmChartSectionBlueprint';
import {KUSTOMIZATION_SECTION_NAME} from '@src/navsections/KustomizationSectionBlueprint';
import {KUSTOMIZE_PATCH_SECTION_NAME} from '@src/navsections/KustomizePatchSectionBlueprint';

import MenuButton from './MenuButton';
import MenuIcon from './MenuIcon';
import * as S from './PaneManagerLeftMenu.styled';
import PaneTooltip from './PaneTooltip';

const PaneManagerLeftMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftDrawerVisible = useAppSelector(state => state.ui.leftMenu.isValidationDrawerVisible);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const helmCharts = useAppSelector(state => Object.values(state.main.helmChartMap));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const kustomizations = useAppSelector(kustomizationsSelector);
  const isActive = Boolean(activeProject) && (leftActive || leftDrawerVisible);

  const [hasSeenKustomizations, setHasSeenKustomizations] = useState<boolean>(false);
  const [hasSeenHelmCharts, setHasSeenHelmCharts] = useState<boolean>(false);

  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);
  const rootFileEntry = useMemo(() => fileMap[ROOT_FILE_ENTRY], [fileMap]);

  const setLeftActiveMenu = (selectedMenu: LeftMenuSelectionType) => {
    if (leftDrawerVisible) {
      dispatch(toggleValidationDrawer(false));
      dispatch(setLeftMenuSelection(selectedMenu));
      if (!leftActive) dispatch(toggleLeftMenu());
      return;
    }

    if (leftMenuSelection === selectedMenu) {
      dispatch(toggleLeftMenu());
    } else {
      trackEvent(SELECT_LEFT_TOOL_PANEL, {panelID: selectedMenu});
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
    <S.Container id="LeftToolbar" isLeftActive={isActive}>
      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'file-explorer')}
        title="View File Explorer"
        placement="right"
      >
        <MenuButton
          id="file-explorer"
          isSelected={!leftDrawerVisible && leftMenuSelection === 'file-explorer'}
          isActive={isActive}
          shouldWatchSelectedPath
          onClick={() => setLeftActiveMenu('file-explorer')}
          disabled={!activeProject}
        >
          <MenuIcon
            style={{marginLeft: 4}}
            icon={isFolderOpen ? FolderOpenOutlined : FolderOutlined}
            active={isActive}
            isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'file-explorer'}
          />
        </MenuButton>
      </PaneTooltip>

      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'kustomize-pane')}
        title="View Kustomizations"
        placement="right"
      >
        <MenuButton
          id="kustomize-pane"
          isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'kustomize-pane'}
          isActive={isActive}
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
              active={Boolean(activeProject) && !leftDrawerVisible && leftActive}
              isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'kustomize-pane'}
            />
          </S.Badge>
        </MenuButton>
      </PaneTooltip>

      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'helm-pane')}
        title="View Helm Charts"
        placement="right"
      >
        <WalkThrough placement="rightTop" step="kustomizeHelm">
          <MenuButton
            id="helm-pane"
            isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'helm-pane'}
            isActive={isActive}
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
                active={isActive}
                isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'helm-pane'}
              />
            </S.Badge>
          </MenuButton>
        </WalkThrough>
      </PaneTooltip>

      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'templates-pane')}
        title="View Templates"
        placement="right"
      >
        <MenuButton
          isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'templates-pane'}
          isActive={isActive}
          onClick={() => setLeftActiveMenu('templates-pane')}
          disabled={!activeProject}
        >
          <MenuIcon
            className={highlightedItems.browseTemplates ? 'animated-highlight' : ''}
            style={highlightedItems.browseTemplates ? {fontSize: '20px', marginLeft: '2px'} : {}}
            icon={FormatPainterOutlined}
            active={isActive}
            isSelected={Boolean(activeProject) && !leftDrawerVisible && leftMenuSelection === 'templates-pane'}
          />
        </MenuButton>
      </PaneTooltip>

      {featureJson.ResourceScanning !== true ? null : (
        <PaneTooltip show={!leftDrawerVisible} title="View Validation" placement="right">
          <MenuButton
            isSelected={leftDrawerVisible}
            isActive={isActive}
            onClick={() => dispatch(toggleValidationDrawer())}
            disabled={!activeProject}
          >
            <MenuIcon iconName="validation" active={isActive} isSelected={leftDrawerVisible} />
          </MenuButton>
        </PaneTooltip>
      )}
    </S.Container>
  );
};

export default PaneManagerLeftMenu;
