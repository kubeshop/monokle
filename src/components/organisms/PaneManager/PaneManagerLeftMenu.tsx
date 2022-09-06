import {useCallback, useEffect, useMemo, useState} from 'react';

import {FolderOpenOutlined, FolderOutlined, FormatPainterOutlined} from '@ant-design/icons';

import {v4 as uuidv4} from 'uuid';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import {
  FileExplorerTabTooltip,
  HelmTabTooltip,
  KustomizeTabTooltip,
  TemplatesTabTooltip,
  TerminalPaneTooltip,
  ValidationTabTooltip,
} from '@constants/tooltips';

import {LeftMenuBottomSelectionType, LeftMenuSelectionType} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {addTerminal, setSelectedTerminal} from '@redux/reducers/terminal';
import {setLeftBottomMenuSelection, setLeftMenuSelection, toggleLeftMenu} from '@redux/reducers/ui';
import {activeProjectSelector, kustomizationsSelector} from '@redux/selectors';

import {Walkthrough} from '@molecules';

import Icon from '@atoms/Icon';

import {FeatureFlag} from '@utils/features';
import {SELECT_LEFT_TOOL_PANEL, trackEvent} from '@utils/telemetry';

import Colors from '@styles/Colors';

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
  const defaultShell = useAppSelector(state => state.terminal.settings.defaultShell);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuBottomSelection = useAppSelector(state => state.ui.leftMenu.bottomSelection);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const helmCharts = useAppSelector(state => Object.values(state.main.helmChartMap));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const kustomizations = useAppSelector(kustomizationsSelector);
  const terminalsMap = useAppSelector(state => state.terminal.terminalsMap);

  const [hasSeenKustomizations, setHasSeenKustomizations] = useState<boolean>(false);
  const [hasSeenHelmCharts, setHasSeenHelmCharts] = useState<boolean>(false);

  const isActive = useMemo(() => Boolean(activeProject) && leftActive, [activeProject, leftActive]);
  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);
  const rootFileEntry = useMemo(() => fileMap[ROOT_FILE_ENTRY], [fileMap]);

  const handleLeftBottomMenuSelection = (selectedOption: LeftMenuBottomSelectionType) => {
    if (!selectedOption) {
      return;
    }

    if (leftMenuBottomSelection === selectedOption) {
      dispatch(setLeftBottomMenuSelection(null));
    } else {
      trackEvent(SELECT_LEFT_TOOL_PANEL, {panelID: selectedOption});
      dispatch(setLeftBottomMenuSelection(selectedOption));
    }
  };

  const setLeftActiveMenu = (selectedMenu: LeftMenuSelectionType) => {
    // close the menu if user clicks on the menu option that is already active
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

  const onTerminalSelectionHandler = () => {
    if (!Object.keys(terminalsMap).length) {
      const newTerminalId = uuidv4();

      dispatch(addTerminal({id: newTerminalId, isRunning: false, shell: defaultShell}));
      dispatch(setSelectedTerminal(newTerminalId));
    }

    handleLeftBottomMenuSelection('terminal');
  };

  const checkIsTabSelected = useCallback(
    (selection: LeftMenuSelectionType) => Boolean(activeProject) && leftMenuSelection === selection,
    [activeProject, leftMenuSelection]
  );
  const checkIsBottomTabSelected = useCallback(
    (selection: LeftMenuBottomSelectionType) => Boolean(activeProject) && leftMenuBottomSelection === selection,
    [activeProject, leftMenuBottomSelection]
  );

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
    <S.Container id="LeftToolbar" $isLeftActive={isActive}>
      <S.IconsContainer>
        <PaneTooltip
          show={!leftActive || leftMenuSelection !== 'file-explorer'}
          title={<FileExplorerTabTooltip />}
          placement="right"
        >
          <MenuButton
            id="file-explorer"
            isSelected={checkIsTabSelected('file-explorer')}
            isActive={isActive}
            shouldWatchSelectedPath
            onClick={() => setLeftActiveMenu('file-explorer')}
            disabled={!activeProject}
          >
            <MenuIcon
              style={{marginLeft: 4}}
              icon={isFolderOpen ? FolderOpenOutlined : FolderOutlined}
              active={isActive}
              isSelected={checkIsTabSelected('file-explorer')}
            />
          </MenuButton>
        </PaneTooltip>

        <FeatureFlag name="GitOps">
          <Walkthrough placement="leftTop" collection="release" step="images">
            <PaneTooltip
              show={!leftActive || leftMenuSelection !== 'git-pane'}
              title="View Git operations"
              placement="right"
            >
              <MenuButton
                id="git-pane"
                isSelected={checkIsTabSelected('git-pane')}
                isActive={isActive}
                onClick={() => setLeftActiveMenu('git-pane')}
                disabled={!activeProject}
              >
                <MenuIcon iconName="git-ops" active={isActive} isSelected={checkIsTabSelected('git-pane')} />
              </MenuButton>
            </PaneTooltip>
          </Walkthrough>
        </FeatureFlag>

        <PaneTooltip
          show={!leftActive || leftMenuSelection !== 'kustomize-pane'}
          title={<KustomizeTabTooltip />}
          placement="right"
        >
          <MenuButton
            id="kustomize-pane"
            isSelected={checkIsTabSelected('kustomize-pane')}
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
                active={Boolean(activeProject) && leftActive}
                isSelected={checkIsTabSelected('kustomize-pane')}
              />
            </S.Badge>
          </MenuButton>
        </PaneTooltip>

        <Walkthrough placement="rightTop" step="kustomizeHelm" collection="novice">
          <PaneTooltip
            show={!leftActive || leftMenuSelection !== 'helm-pane'}
            title={<HelmTabTooltip />}
            placement="right"
          >
            <MenuButton
              id="helm-pane"
              isSelected={checkIsTabSelected('helm-pane')}
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
                <MenuIcon iconName="helm" active={isActive} isSelected={checkIsTabSelected('helm-pane')} />
              </S.Badge>
            </MenuButton>
          </PaneTooltip>
        </Walkthrough>

        <FeatureFlag name="ImagesPane">
          <Walkthrough placement="leftTop" collection="release" step="images">
            <PaneTooltip
              show={!leftActive || leftMenuSelection !== 'images-pane'}
              title="View Images"
              placement="right"
            >
              <MenuButton
                isSelected={checkIsTabSelected('images-pane')}
                isActive={isActive}
                onClick={() => setLeftActiveMenu('images-pane')}
                disabled={!activeProject}
              >
                <MenuIcon iconName="images" active={isActive} isSelected={checkIsTabSelected('images-pane')} />
              </MenuButton>
            </PaneTooltip>
          </Walkthrough>
        </FeatureFlag>
        <PaneTooltip
          show={!leftActive || leftMenuSelection !== 'templates-pane'}
          title={TemplatesTabTooltip}
          placement="right"
        >
          <MenuButton
            isSelected={checkIsTabSelected('templates-pane')}
            isActive={isActive}
            onClick={() => setLeftActiveMenu('templates-pane')}
            disabled={!activeProject}
          >
            <MenuIcon
              className={highlightedItems.browseTemplates ? 'animated-highlight' : ''}
              style={highlightedItems.browseTemplates ? {fontSize: '20px', marginLeft: '2px'} : {}}
              icon={FormatPainterOutlined}
              active={isActive}
              isSelected={checkIsTabSelected('templates-pane')}
            />
          </MenuButton>
        </PaneTooltip>
        <PaneTooltip
          show={!leftActive || leftMenuSelection !== 'validation-pane'}
          title={<ValidationTabTooltip />}
          placement="right"
        >
          <MenuButton
            id="validation"
            isSelected={checkIsTabSelected('validation-pane')}
            isActive={isActive}
            onClick={() => setLeftActiveMenu('validation-pane')}
            disabled={!activeProject}
          >
            <MenuIcon iconName="validation" active={isActive} isSelected={checkIsTabSelected('validation-pane')} />
          </MenuButton>
        </PaneTooltip>
        <PaneTooltip show={!leftActive || leftMenuSelection !== 'search'} title="Advanced Search" placement="right">
          <MenuButton
            isSelected={checkIsTabSelected('search')}
            isActive={isActive}
            onClick={() => setLeftActiveMenu('search')}
            disabled={!activeProject}
            icon={<Icon name="search" style={{opacity: leftMenuSelection === 'search' ? '1' : '0.5'}} />}
          >
            <MenuIcon iconName="search" active={isActive} isSelected={checkIsTabSelected('search')} />
          </MenuButton>
        </PaneTooltip>
      </S.IconsContainer>

      <S.IconsContainer>
        <FeatureFlag name="Terminal">
          <PaneTooltip
            show={!leftActive || leftMenuBottomSelection !== 'terminal'}
            title={<TerminalPaneTooltip />}
            placement="right"
          >
            <MenuButton
              id="terminal"
              isSelected={checkIsBottomTabSelected('terminal')}
              isActive={isActive}
              onClick={onTerminalSelectionHandler}
              disabled={!activeProject}
            >
              <MenuIcon iconName="terminal" active={isActive} isSelected={checkIsBottomTabSelected('terminal')} />
            </MenuButton>
          </PaneTooltip>
        </FeatureFlag>
      </S.IconsContainer>
    </S.Container>
  );
};

export default PaneManagerLeftMenu;
