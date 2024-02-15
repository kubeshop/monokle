import {useMemo} from 'react';

import {Button, MenuProps, Tooltip} from 'antd';

import {CommentOutlined, GlobalOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import semver from 'semver';
import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {FeedbackTooltip} from '@constants/tooltips';

import {useAppDispatch} from '@redux/hooks';
import {openAboutModal, openKeyboardShortcutsModal, openReleaseNotesDrawer} from '@redux/reducers/ui';

import {AnimationDurations} from '@shared/styles';
import {Colors} from '@shared/styles/colors';
import {
  openDiscord,
  openDocumentation,
  openFeedback,
  openGitHub,
  openGitHubAction,
  openMonokleChromeExtension,
  openMonokleCli,
} from '@shared/utils/shell';

import {useAppVersion} from '../useAppVersion';

export function useHelpMenuItems() {
  const dispatch = useAppDispatch();

  const appVersion = useAppVersion();

  const parsedAppVersion = useMemo(() => {
    const version = semver.parse(appVersion);

    if (!version) {
      return undefined;
    }

    return `${version.major}.${version.minor}`;
  }, [appVersion]);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'help',
        label: (
          <>
            {renderMenuItem('Help', <QuestionCircleOutlined />)}

            <MenuItemLinks>
              <HelpLink type="link" size="small" onClick={() => dispatch(openKeyboardShortcutsModal())}>
                Keyboard Shortcuts
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => openDocumentation()}>
                Documentation
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => dispatch(openReleaseNotesDrawer())}>
                New in {parsedAppVersion || 'this version'}
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => openGitHub()}>
                Github
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => openDiscord()}>
                Discord
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => dispatch(openAboutModal())}>
                About Monokle
              </HelpLink>
            </MenuItemLinks>
          </>
        ),
      },
      {
        label: (
          <>
            {renderMenuItem('Discover More', <GlobalOutlined />, false, false)}

            <MenuItemLinks>
              <HelpLink type="link" size="small" onClick={() => openGitHubAction()}>
                Monokle GitHub Action
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => openMonokleCli()}>
                Monokle CLI
              </HelpLink>
              <HelpLink type="link" size="small" onClick={() => openMonokleChromeExtension()}>
                Monokle Chrome Extension
              </HelpLink>
            </MenuItemLinks>
          </>
        ),
        key: 'discover',
      },
      {
        label: (
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FeedbackTooltip}>
            {renderMenuItem('Feedback', <CommentOutlined />, false, true)}
          </Tooltip>
        ),
        key: 'feedback',
        onClick: () => openFeedback(),
      },
    ],
    [dispatch, parsedAppVersion]
  );

  return items;
}

const renderMenuItem = (label: string, icon: JSX.Element, border?: boolean, cursorPointer?: boolean) => (
  <MenuItem style={{cursor: cursorPointer ? 'pointer' : 'default'}} $border={border}>
    {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
    <MenuItemLabel>{label}</MenuItemLabel>
  </MenuItem>
);

// StyledComponents

const HelpLink = styled(Button)`
  color: ${Colors.grey9};
`;

const MenuItem = styled.div<{$border?: boolean; $disabled?: boolean}>`
  background-color: transparent;
  color: ${Colors.grey9};
  font-weight: 700;
  font-size: 14px;
  height: 40px;
  display: flex;
  align-items: center;
  cursor: ${props => (props.$disabled ? 'default' : 'pointer')};
  padding: 0px 12px;
  transition: all ${AnimationDurations.fast} ease-in;

  ${props =>
    !props.$disabled &&
    `
  &:hover {
    opacity: 0.8;
  }
  `}

  ${({$border}) => {
    if ($border) {
      return `border-bottom: 1px solid ${Colors.grey5}`;
    }
  }}
`;

const MenuItemIcon = styled.span`
  width: 25px;
`;

const MenuItemLabel = styled.span`
  padding: 0 8px;
`;

const MenuItemLinks = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 0px 10px 0.5rem 37px;
  margin-top: -0.5rem;
  border-bottom: 1px solid ${Colors.grey5};
`;
