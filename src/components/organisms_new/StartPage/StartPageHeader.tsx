import {useState} from 'react';

import {AutoComplete, Badge, Dropdown, Popover, Tooltip} from 'antd';

import {BellOutlined, EllipsisOutlined} from '@ant-design/icons';

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
  const projects = useAppSelector(state => state.config.projects);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [searchProject, setSearchProject] = useState('');
  const [openProjectList, setOpenProjectList] = useState(false);

  const helpMenuItems = useHelpMenuItems();

  const onSearchProjectChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchProject(e.target.value);
  };

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

      <AutoComplete
        style={{width: '340px'}}
        options={projects.map(p => ({value: p.name, label: p.name}))}
        open={openProjectList}
        searchValue={searchProject}
        filterOption={(inputValue, option) => Boolean(option?.value?.startsWith(inputValue))}
        onFocus={() => setOpenProjectList(true)}
        onBlur={() => setOpenProjectList(false)}
        onSelect={onSelectProjectHandler}
      >
        <SearchInput onChange={onSearchProjectChangeHandler} value={searchProject} />
      </AutoComplete>

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
