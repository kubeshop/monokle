import {shell} from 'electron';

import {useCallback, useEffect, useRef, useState} from 'react';
import {useMeasure} from 'react-use';

import {Badge, Button, Dropdown, Tooltip} from 'antd';

import {ReloadOutlined} from '@ant-design/icons';

import newGithubIssueUrl from 'new-github-issue-url';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setAutosavingError} from '@redux/reducers/main';
import {setLayoutSize, toggleNotifications, toggleStartProjectPane} from '@redux/reducers/ui';
import {activeProjectSelector, isInPreviewModeSelector} from '@redux/selectors';

import MonokleKubeshopLogo from '@assets/MonokleLogoDark.svg';

import ClusterSelection from './ClusterSelection';
import CreateProject from './CreateProject';
import {HelpMenu} from './HelpMenu';
import * as S from './PageHeader.styled';
import ProjectSelection from './ProjectSelection';

const PageHeader = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const autosavingError = useAppSelector(state => state.main.autosaving.error);
  const autosavingStatus = useAppSelector(state => state.main.autosaving.status);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);

  let timeoutRef = useRef<any>(null);

  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
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
      {isInPreviewMode && <S.PreviewRow noborder="true" previewType={previewType} />}

      <S.Header noborder="true">
        <S.Row noborder="true">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <S.Logo id="monokle-logo-header" onClick={showGetStartingPage} src={MonokleKubeshopLogo} alt="Monokle" />

            {activeProject && (
              <>
                <S.Divider type="vertical" style={{marginRight: '1rem'}} />
                <ProjectSelection />
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
        </S.Row>
      </S.Header>
    </S.PageHeaderContainer>
  );
};

export default PageHeader;
