import {useMemo, useState} from 'react';

import {AutoComplete, Badge, Dropdown, Popover, Tooltip, Typography} from 'antd';

import {BellOutlined, EllipsisOutlined} from '@ant-design/icons';

import _ from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setOpenProject} from '@redux/reducers/appConfig';
import {setShowStartPageLearn, toggleNotifications} from '@redux/reducers/ui';

import {WelcomePopupContent} from '@molecules';

import {IconButton} from '@atoms';

import {useHelpMenuItems} from '@hooks/menuItemsHooks';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import {SearchInput} from '@monokle/components';

import * as S from './StartPageHeader.styled';

const StartPageHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const isStartPageLearnVisible = useAppSelector(state => state.ui.startPageLearn.isVisible);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);
  const isWelcomePopupVisible = useAppSelector(state => state.ui.welcomePopup.isVisible);
  const projects = useAppSelector(state => _.sortBy(state.config.projects, p => p?.name?.toLowerCase()));
  const selectedProjectRootFolder = useAppSelector(state => state.config.selectedProjectRootFolder);

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
      })),
    [projects, selectedProjectRootFolder]
  );

  const onSelectProjectHandler = (value: string) => {
    const targetProject = projects.find(p => p.name === value);
    if (targetProject) {
      dispatch(setOpenProject(targetProject.rootFolder));
    }
  };

  return (
    <S.StartPageHeaderContainer>
      <S.LogoContainer>
        <S.Logo id="monokle-logo-header" src={MonokleKubeshopLogo} alt="Monokle" />
      </S.LogoContainer>

      <S.SearchContainer>
        <AutoComplete
          style={{width: '340px'}}
          options={ProjectOptions}
          filterOption={(inputValue, option) => Boolean(option?.value?.startsWith(inputValue))}
          onSelect={onSelectProjectHandler}
          notFoundContent="Nothing found"
          getPopupContainer={() => document.getElementById('projectsList')!}
          showAction={['focus']}
        >
          <SearchInput placeholder="Find repositories & projects" />
        </AutoComplete>
        <div id="projectsList" />
      </S.SearchContainer>
      <S.ActionsContainer>
        <Popover
          zIndex={100}
          content={<WelcomePopupContent />}
          overlayClassName="welcome-popup"
          open={isWelcomePopupVisible}
          placement="leftTop"
        >
          <S.LearnButton
            $isActive={isStartPageLearnVisible}
            type="text"
            onClick={() => {
              dispatch(setShowStartPageLearn(true));
            }}
          >
            Learn
          </S.LearnButton>
        </Popover>

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
