import {useState} from 'react';

import {Badge, Dropdown, Tooltip} from 'antd';

import {BellOutlined, EllipsisOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';
import {NotificationsTooltip} from '@constants/tooltips';

import {useAppSelector} from '@redux/hooks';

import {HelpMenu} from '@organisms/PageHeader/HelpMenu';

import {IconButton, SearchInput} from '@atoms';

import MonokleKubeshopLogo from '@assets/NewMonokleLogoDark.svg';

import * as S from './StatePageHeader.styled';

const StartPageHeader: React.FC = () => {
  const unseenNotificationsCount = useAppSelector(state => state.main.notifications.filter(n => !n.hasSeen).length);

  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  return (
    <S.StartPageHeaderContainer>
      <S.LogoContainer>
        <S.Logo id="monokle-logo-header" src={MonokleKubeshopLogo} alt="Monokle" />
      </S.LogoContainer>

      <SearchInput style={{width: '340px'}} />

      <S.ActionsContainer>
        <S.LearnButton type="text">Learn</S.LearnButton>

        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={NotificationsTooltip}>
          <Badge count={unseenNotificationsCount} size="small">
            <IconButton $size="large">
              <BellOutlined />
            </IconButton>
          </Badge>
        </Tooltip>

        <Dropdown
          open={isHelpMenuOpen}
          placement="bottomLeft"
          onOpenChange={() => {
            setIsHelpMenuOpen(!isHelpMenuOpen);
          }}
          overlay={
            <HelpMenu
              onMenuClose={() => {
                setIsHelpMenuOpen(false);
              }}
            />
          }
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
