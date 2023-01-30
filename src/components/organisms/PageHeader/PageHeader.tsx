import {shell} from 'electron';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Badge, Button, Dropdown, Tooltip} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import newGithubIssueUrl from 'new-github-issue-url';

import {TOOLTIP_DELAY} from '@constants/constants';
import {InitializeGitTooltip, InstallGitTooltip, NotificationsTooltip} from '@constants/tooltips';

import {setCurrentBranch, setRepo} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectsGitRepo} from '@redux/reducers/appConfig';
import {setAutosavingError} from '@redux/reducers/main';
import {setIsInQuickClusterMode, setLayoutSize, toggleNotifications, toggleStartProjectPane} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';
import {monitorGitFolder} from '@redux/services/gitFolderMonitor';
import {stopPreview} from '@redux/services/preview';
import store from '@redux/store';

import BranchSelect from '@components/molecules/BranchSelect';

import {useHelpMenuItems} from '@hooks/menuItemsHooks';

import {promiseFromIpcRenderer} from '@utils/promises';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import {Icon} from '@monokle/components';
import {activeProjectSelector} from '@shared/utils/selectors';
import {trackEvent} from '@shared/utils/telemetry';

import ClusterSelection from './ClusterSelection';
import {K8sVersionSelection} from './K8sVersionSelection';
import {OPAChip} from './OPAChip';
import * as S from './PageHeader.styled';

const PageHeader = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const autosavingError = useAppSelector(state => state.main.autosaving.error);
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const gitLoading = useAppSelector(state => state.git.loading);
  const hasGitRepo = useAppSelector(state => Boolean(state.git.repo));
  const isGitInstalled = useAppSelector(state => state.git.isGitInstalled);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const projectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  // const resourceMap = useAppSelector(state => state.main.resourceMap);

  let timeoutRef = useRef<any>(null);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isInitializingGitRepo, setIsInitializingGitRepo] = useState(false);
  const [showAutosaving, setShowAutosaving] = useState(false);

  const helpMenuItems = useHelpMenuItems();

  // const runningPreviewConfiguration = useAppSelector(state => {
  //   if (!state.main.previewConfigurationId) {
  //     return undefined;
  //   }
  //   return state.config.projectConfig?.helm?.previewConfigurationMap?.[state.main.previewConfigurationId];
  // });

  const [pageHeaderRef, {height: pageHeaderHeight}] = useMeasure<HTMLDivElement>();

  const toggleNotificationsDrawer = () => {
    dispatch(toggleNotifications());
  };

  const onClickLogoHandler = () => {
    if (!isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
    }

    if (isInQuickClusterMode) {
      dispatch(setIsInQuickClusterMode(false));
    }

    if (isInClusterMode) {
      stopPreview(dispatch);
    }
  };

  const createGitHubIssue = useCallback(() => {
    if (!autosavingError) {
      return null;
    }

    const url = newGithubIssueUrl({
      user: 'kubeshop',
      repo: 'monokle',
      title: '[crash] Something went wrong',
      body: `**Describe the bug**\n\n\n**Steps to reproduce**\n\n\n**Stacktrace** \n\n \`\`\`\n${autosavingError.message}\n ${autosavingError.stack}\n\`\`\``,
      labels: ['bug'],
    });

    shell.openExternal(url);
  }, [autosavingError]);

  const initGitRepo = async () => {
    if (!projectRootFolder) {
      return;
    }

    trackEvent('git/initialize');
    setIsInitializingGitRepo(true);

    await promiseFromIpcRenderer('git.initGitRepo', 'git.initGitRepo.result', projectRootFolder);

    monitorGitFolder(projectRootFolder, store);

    promiseFromIpcRenderer('git.getGitRepoInfo', 'git.getGitRepoInfo.result', projectRootFolder).then(result => {
      dispatch(setRepo(result));
      dispatch(setCurrentBranch(result.currentBranch));
      setIsInitializingGitRepo(false);
      dispatch(updateProjectsGitRepo([{path: projectRootFolder, isGitRepo: true}]));
    });
  };

  const onClickProjectHandler = () => {
    dispatch(toggleStartProjectPane());
  };

  useEffect(() => {
    if (pageHeaderHeight) {
      dispatch(setLayoutSize({...layoutSize, header: pageHeaderHeight}));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageHeaderHeight]);

  useEffect(() => {
    if (autosavingStatus === undefined) {
      return;
    }

    if (!autosavingStatus && showAutosaving) {
      let timeoutTime = 3000;

      if (autosavingError) {
        timeoutTime = 5000;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (autosavingError) {
          dispatch(setAutosavingError(undefined));
        }

        setShowAutosaving(false);
      }, timeoutTime);
    } else {
      setShowAutosaving(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosavingStatus]);

  return (
    <S.PageHeaderContainer ref={pageHeaderRef}>
      {/* {isInPreviewMode &&
        <S.PreviewRow
          // $previewType={previewType}
          $kubeConfigContextColor={kubeConfigContextColor} />
      } */}

      <S.Header>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <S.LogoContainer>
            <S.Logo id="monokle-logo-header" onClick={onClickLogoHandler} src={MonokleKubeshopLogo} alt="Monokle" />
          </S.LogoContainer>

          {activeProject && (
            <>
              <S.Divider type="vertical" />
              <S.ActiveProjectButton onClick={onClickProjectHandler}>
                <S.MenuOutlinedIcon />
                <S.ProjectName>{activeProject.name}</S.ProjectName>
              </S.ActiveProjectButton>
              {hasGitRepo ? (
                <S.BranchSelectContainer>
                  <BranchSelect />
                </S.BranchSelectContainer>
              ) : (
                <Tooltip
                  mouseEnterDelay={TOOLTIP_DELAY}
                  placement="bottomRight"
                  title={isGitInstalled ? InitializeGitTooltip : InstallGitTooltip}
                >
                  <S.InitButton
                    disabled={!isGitInstalled}
                    icon={<Icon name="git" />}
                    loading={isInitializingGitRepo || gitLoading}
                    type="primary"
                    size="small"
                    onClick={initGitRepo}
                  >
                    Initialize Git
                  </S.InitButton>
                </Tooltip>
              )}
            </>
          )}

          {showAutosaving && (
            <S.AutosavingContainer>
              {autosavingStatus ? (
                <>
                  <ReloadOutlined spin />
                  Saving...
                </>
              ) : autosavingError ? (
                <S.AutosavingErrorContainer>
                  Your changes could not be saved
                  <Button type="link" onClick={createGitHubIssue}>
                    Report
                  </Button>
                </S.AutosavingErrorContainer>
              ) : (
                autosavingStatus === false && 'Saved'
              )}
            </S.AutosavingContainer>
          )}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          {projectRootFolder && (
            <>
              <OPAChip />
              <K8sVersionSelection />
            </>
          )}
          <ClusterSelection />
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
            <Badge count={unseenNotificationsCount} size="small">
              <S.BellOutlined onClick={toggleNotificationsDrawer} />
            </Badge>
          </Tooltip>
          <Dropdown
            menu={{
              items: helpMenuItems,
              onClick: () => {
                setIsHelpMenuOpen(false);
              },
            }}
            open={isHelpMenuOpen}
            onOpenChange={() => {
              setIsHelpMenuOpen(!isHelpMenuOpen);
            }}
            placement="bottomLeft"
            overlayClassName="help-menu-dropdown"
          >
            <S.EllipsisOutlined />
          </Dropdown>
        </div>
      </S.Header>
    </S.PageHeaderContainer>
  );
};

export default PageHeader;
