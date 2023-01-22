import {useState} from 'react';

import {Badge, Dropdown, Tooltip} from 'antd';

import {BellOutlined, EllipsisOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setShowStartPageLearn, toggleNotifications, toggleStartProjectPane} from '@redux/reducers/ui';

import {IconButton} from '@atoms';

import {useHelpMenuItems} from '@hooks/useHelpMenuItems';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import {activeProjectSelector} from '@shared/utils/selectors';

import * as S from './StatePageHeader.styled';

const StartPageHeader: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const isStartPageLearnVisible = useAppSelector(state => state.ui.startPageLearn.isVisible);
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  const helpMenuItems = useHelpMenuItems();

  return (
    <S.StartPageHeaderContainer>
      <S.LogoContainer>
        <S.Logo
          id="monokle-logo-header"
          src={MonokleKubeshopLogo}
          alt="Monokle"
          onClick={() => {
            if (activeProject) {
              dispatch(toggleStartProjectPane());
            }
          }}
        />
      </S.LogoContainer>

      {/* <SearchInput style={{width: '340px'}} /> */}

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
