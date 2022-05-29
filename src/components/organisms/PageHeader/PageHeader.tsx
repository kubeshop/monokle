import {useEffect, useState} from 'react';
import {useMeasure} from 'react-use';

import {Badge, Dropdown, Tooltip} from 'antd';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {K8sResource} from '@models/k8sresource';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
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
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const isStartProjectPaneVisible = useAppSelector(state => state.ui.isStartProjectPaneVisible);
  const layoutSize = useAppSelector(state => state.ui.layoutSize);
  const previewResourceId = useAppSelector(state => state.main.previewResourceId);
  const previewType = useAppSelector(state => state.main.previewType);
  const previewValuesFileId = useAppSelector(state => state.main.previewValuesFileId);
  const resourceMap = useAppSelector(state => state.main.resourceMap);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const activeProject = useAppSelector(activeProjectSelector);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

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
          </div>

          <div style={{display: 'flex', alignItems: 'center'}}>
            <ClusterSelection previewResource={previewResource} />
            <S.SettingsCol>
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
                placement="bottom"
              >
                <S.EllipsisOutlined />
              </Dropdown>
            </S.SettingsCol>
          </div>
        </S.Row>
      </S.Header>
    </S.PageHeaderContainer>
  );
};

export default PageHeader;
