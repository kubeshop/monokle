import {useMemo, useState} from 'react';

import {AutoComplete, Badge, Dropdown, Tooltip, Typography} from 'antd';

import {BellOutlined, EllipsisOutlined, LeftOutlined} from '@ant-design/icons';

import _ from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  setShowStartPageLearn,
  setStartPageMenuOption,
  toggleNotifications,
  toggleStartProjectPane,
} from '@redux/reducers/ui';
import {setOpenProject} from '@redux/thunks/project';

import {NewVersionNotice} from '@molecules';

import {IconButton} from '@atoms';

import {useHelpMenuItems} from '@hooks/menuItemsHooks';

import {useRefSelector} from '@utils/hooks';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import {SearchInput} from '@monokle/components';
import {activeProjectSelector, trackEvent} from '@shared/utils';

import * as S from './StartPageHeader.styled';

const StartPageHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isNewVersionAvailable = useAppSelector(state => state.config.isNewVersionAvailable);
  const isNewVersionNoticeVisible = useAppSelector(state => state.ui.newVersionNotice.isVisible);
  const isStartPageLearnVisible = useAppSelector(state => state.ui.startPage.learn.isVisible);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const projects = useAppSelector(state => _.sortBy(state.config.projects, p => p?.name?.toLowerCase()));
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

  const isStartProjectPaneVisibleRef = useRefSelector(state => state.ui.isStartProjectPaneVisible);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  const helpMenuItems = useHelpMenuItems();

  const ProjectOptions = useMemo(
    () =>
      projects.map(p => ({
        className: p.rootFolder === selectedProjectRootFolder ? 'selected-menu-item' : '',
        value: p.name,
        label: (
          <S.SearchItemLabel>
            <Typography.Text>Project</Typography.Text>
            <Typography.Text>{p.name}</Typography.Text>
          </S.SearchItemLabel>
        ),
        key: `${p.name}-${p.rootFolder}`,
      })),
    [projects, selectedProjectRootFolder]
  );

  const onSelectProjectHandler = (value: string) => {
    const targetProject = projects.find(p => p.name === value);
    if (targetProject) {
      trackEvent('app_start/select_project');
      dispatch(setOpenProject(targetProject.rootFolder));
    }
  };

  return (
    <S.StartPageHeaderContainer>
      <S.LogoContainer $isNewVersionNoticeVisible={isNewVersionNoticeVisible}>
        <S.NewVersionBadge dot={isNewVersionAvailable}>
          <NewVersionNotice>
            <S.Logo
              id="monokle-logo-header"
              src={MonokleKubeshopLogo}
              alt="Monokle"
              onClick={() => {
                if (isStartProjectPaneVisibleRef.current) {
                  return;
                }

                dispatch(setStartPageMenuOption('new-project'));
              }}
            />
          </NewVersionNotice>
        </S.NewVersionBadge>
      </S.LogoContainer>

      {activeProject && (
        <S.BackToProjectButton
          icon={<LeftOutlined />}
          onClick={() => {
            dispatch(toggleStartProjectPane());
          }}
        >
          Back to project
        </S.BackToProjectButton>
      )}

      <S.SearchContainer>
        <AutoComplete
          style={{width: '340px'}}
          options={ProjectOptions}
          filterOption={(inputValue, option) =>
            Boolean(option?.value?.toLowerCase().includes(inputValue.toLowerCase()))
          }
          onSelect={onSelectProjectHandler}
          notFoundContent="Nothing found"
          getPopupContainer={() => document.getElementById('projectsList')!}
          showAction={['focus']}
        >
          <SearchInput placeholder="Find projects" autoFocus={false} />
        </AutoComplete>
        <div id="projectsList" />
      </S.SearchContainer>

      <S.ActionsContainer>
        <S.LearnButton
          $isActive={isStartPageLearnVisible}
          type="text"
          onClick={() => {
            dispatch(setShowStartPageLearn(true));
          }}
        >
          Learn
        </S.LearnButton>

        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
          <Badge count={unseenNotificationsCount} size="small">
            <IconButton
              $size="large"
              onClick={() => {
                dispatch(toggleNotifications());
              }}
            >
              <BellOutlined />
            </IconButton>
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
          <IconButton $size="large" style={{marginLeft: '5px'}}>
            <EllipsisOutlined />
          </IconButton>
        </Dropdown>
      </S.ActionsContainer>
    </S.StartPageHeaderContainer>
  );
};

export default StartPageHeader;
