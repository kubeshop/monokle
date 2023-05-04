import {shell} from 'electron';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Badge, Button, Dropdown, Tooltip} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import newGithubIssueUrl from 'new-github-issue-url';

import {TOOLTIP_DELAY} from '@constants/constants';
import {InitializeGitTooltip, InstallGitTooltip, NotificationsTooltip} from '@constants/tooltips';

import {activeProjectSelector, updateProjectsGitRepo} from '@redux/appConfig';
import {setCurrentBranch, setRepo} from '@redux/git';
import {getRepoInfo, initGitRepo} from '@redux/git/git.ipc';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingError} from '@redux/reducers/main';
import {setIsInQuickClusterMode, setLayoutSize, toggleNotifications, toggleStartProjectPane} from '@redux/reducers/ui';
import {monitorGitFolder} from '@redux/services/gitFolderMonitor';
import {stopPreview} from '@redux/services/preview';
import store from '@redux/store';

import {BranchSelect, NewVersionNotice} from '@molecules';

import {useHelpMenuItems} from '@hooks/menuItemsHooks';

import {showGitErrorModal} from '@utils/terminal';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import {Icon} from '@monokle/components';
import {isInClusterModeSelector, isInPreviewModeSelector} from '@shared/utils/selectors';
import {trackEvent} from '@shared/utils/telemetry';

import {ClusterControls} from './ClusterControl/ClusterControls';
import DownloadProgress from './DownloadProgress';
import {K8sVersionSelection} from './K8sVersionSelection';
import * as S from './PageHeader.styled';
import {PreviewControls} from './PreviewControl/PreviewControls';

const PageHeader = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const autosavingError = useAppSelector(state => state.main.autosaving.error);
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const gitLoading = useAppSelector(state => state.git.loading);
  const hasGitRepo = useAppSelector(state => Boolean(state.git.repo));
  const isGitInstalled = useAppSelector(state => state.git.isGitInstalled);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const projectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);
  const isNewVersionAvailable = useAppSelector(state => state.config.isNewVersionAvailable);
  const isNewVersionNoticeVisible = useAppSelector(state => state.ui.newVersionNotice.isVisible);

  let timeoutRef = useRef<any>(null);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isInitializingGitRepo, setIsInitializingGitRepo] = useState(false);
  const [showAutosaving, setShowAutosaving] = useState(false);

  const helpMenuItems = useHelpMenuItems();
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

  const initGitRepoHandler = async () => {
    if (!projectRootFolder) {
      return;
    }

    trackEvent('git/initialize');
    setIsInitializingGitRepo(true);

    try {
      await initGitRepo({path: projectRootFolder});
    } catch (e: any) {
      showGitErrorModal('Failed to initialize git repo', e.message);
      setIsInitializingGitRepo(false);
      return;
    }

    monitorGitFolder(projectRootFolder, store);

    try {
      await getRepoInfo({path: projectRootFolder || ''}).then(repo => {
        dispatch(setRepo(repo));
        dispatch(setCurrentBranch(repo.currentBranch));
        setIsInitializingGitRepo(false);
        dispatch(updateProjectsGitRepo([{path: projectRootFolder, isGitRepo: true}]));
      });
    } catch (e: any) {
      showGitErrorModal('Git repo error', e.message);
    }
  };

  const onClickProjectHandler = () => {
    dispatch(toggleStartProjectPane());

    if (isInQuickClusterMode) {
      dispatch(setIsInQuickClusterMode(false));
    }

    if (isInClusterMode) {
      stopPreview(dispatch);
    }
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
      <S.Header>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <S.LogoContainer $isNewVersionNoticeVisible={isNewVersionNoticeVisible}>
            <S.NewVersionBadge dot={isNewVersionAvailable}>
              <NewVersionNotice>
                <S.Logo id="monokle-logo-header" onClick={onClickLogoHandler} src={MonokleKubeshopLogo} alt="Monokle" />
              </NewVersionNotice>
            </S.NewVersionBadge>
          </S.LogoContainer>

          <S.Divider type="vertical" />
          {activeProject ? (
            <>
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
                    type="text"
                    size="small"
                    onClick={initGitRepoHandler}
                  >
                    Initialize Git
                  </S.InitButton>
                </Tooltip>
              )}
            </>
          ) : (
            <S.BackProjectsButton type="primary" size="small" onClick={onClickLogoHandler}>
              Back to projects
            </S.BackProjectsButton>
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

          <DownloadProgress />
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <K8sVersionSelection />
          {isInPreviewMode ? <PreviewControls /> : <ClusterControls />}

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
            <Badge count={unseenNotificationsCount} size="small">
              <S.BellOutlined onClick={toggleNotificationsDrawer} />
            </Badge>
          </Tooltip>
          <Dropdown
            trigger={['click']}
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
