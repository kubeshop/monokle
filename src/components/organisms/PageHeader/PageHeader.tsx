import {shell} from 'electron';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Badge, Button, Dropdown, Tooltip} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import newGithubIssueUrl from 'new-github-issue-url';

import {TOOLTIP_DELAY} from '@constants/constants';
import {InitializeGitTooltip, NotificationsTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {setRepo} from '@redux/git';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {updateProjectsGitRepo} from '@redux/reducers/appConfig';
import {setAutosavingError} from '@redux/reducers/main';
import {setLayoutSize, toggleNotifications, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector, isInPreviewModeSelector, kubeConfigContextColorSelector} from '@redux/selectors';

import {Icon} from '@components/atoms';
import BranchSelect from '@components/molecules/BranchSelect';

import {promiseFromIpcRenderer} from '@utils/promises';

import MonokleKubeshopLogo from '@assets/MonokleLogoDark.svg';

import ClusterSelection from './ClusterSelection';
import CreateProject from './CreateProject';
import {HelpMenu} from './HelpMenu';
import * as S from './PageHeader.styled';
import ProjectSelection from './ProjectSelection';

const PageHeader = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const autosavingError = useAppSelector(state => state.main.autosaving.error);
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const hasGitRepo = useAppSelector(state => Boolean(state.git.repo));
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const projectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  let timeoutRef = useRef<any>(null);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isInitializingGitRepo, setIsInitializingGitRepo] = useState(false);
  const [showAutosaving, setShowAutosaving] = useState(false);

  const runningPreviewConfiguration = useAppSelector(state => {
    if (!state.main.previewConfigurationId) {
      return undefined;
    }
    return state.config.projectConfig?.helm?.previewConfigurationMap?.[state.main.previewConfigurationId];
  });

  const [previewResource, setPreviewResource] = useState<K8sResource>();

  const [pageHeaderRef, {height: pageHeaderHeight}] = useMeasure<HTMLDivElement>();

  const toggleNotificationsDrawer = () => {
    dispatch(toggleNotifications());
  };

  const showGetStartingPage = () => {
    if (!isStartProjectPaneVisible) {
      dispatch(toggleStartProjectPane());
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

    setIsInitializingGitRepo(true);

    await promiseFromIpcRenderer('git.initGitRepo', 'git.initGitRepo.result', projectRootFolder);

    promiseFromIpcRenderer('git.fetchGitRepo', 'git.fetchGitRepo.result', projectRootFolder).then(result => {
      dispatch(setRepo(result));
      setIsInitializingGitRepo(false);
      dispatch(updateProjectsGitRepo([{path: projectRootFolder, isGitRepo: true}]));
    });
  };

  useEffect(() => {
    if (previewResourceId) {
      setPreviewResource(resourceMap[previewResourceId]);
    } else {
      setPreviewResource(undefined);
    }
  }, [previewResourceId, previewValuesFileId, helmValuesMap, resourceMap, helmChartMap, runningPreviewConfiguration]);

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
      {isInPreviewMode && <S.PreviewRow $previewType={previewType} $kubeConfigContextColor={kubeConfigContextColor} />}

      <S.Header>
        <div style={{display: 'flex', alignItems: 'center'}}>
          <S.Logo id="monokle-logo-header" onClick={showGetStartingPage} src={MonokleKubeshopLogo} alt="Monokle" />

          {activeProject && (
            <>
              <S.Divider type="vertical" />
              <ProjectSelection />
              {hasGitRepo ? (
                <S.BranchSelectContainer>
                  <BranchSelect />
                </S.BranchSelectContainer>
              ) : (
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} placement="bottomRight" title={InitializeGitTooltip}>
                  <S.InitButton
                    icon={<Icon name="git" />}
                    loading={isInitializingGitRepo}
                    type="primary"
                    size="small"
                    onClick={initGitRepo}
                  >
                    Initialize Git
                  </S.InitButton>
                </Tooltip>
              )}
              <CreateProject />
            </>
          )}
          {isStartProjectPaneVisible && activeProject && (
            <>
              <S.Divider type="vertical" style={{margin: '0 0.5rem', height: '1rem'}} />
              <S.BackToProjectButton type="link" onClick={() => dispatch(toggleStartProjectPane())}>
                Back to Project
              </S.BackToProjectButton>
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

        <div style={{display: 'flex', alignItems: 'center'}}>
          <ClusterSelection previewResource={previewResource} />

          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
            <Badge count={unseenNotificationsCount} size="small">
              <S.BellOutlined onClick={toggleNotificationsDrawer} />
            </Badge>
          </Tooltip>

          <Dropdown
            visible={isHelpMenuOpen}
            onVisibleChange={() => {
              setIsHelpMenuOpen(!isHelpMenuOpen);
            }}
            overlay={
              <HelpMenu
                onMenuClose={() => {
                  setIsHelpMenuOpen(false);
                }}
              />
            }
            placement="bottomLeft"
          >
            <S.EllipsisOutlined />
          </Dropdown>
        </div>
      </S.Header>
    </S.PageHeaderContainer>
  );
};

export default PageHeader;
