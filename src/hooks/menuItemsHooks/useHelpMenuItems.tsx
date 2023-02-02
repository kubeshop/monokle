import {useMemo} from 'react';

import {Button, MenuProps, Tooltip} from 'antd';

import {ApiOutlined, CommentOutlined, QuestionCircleOutlined, SettingOutlined} from '@ant-design/icons';

import semver from 'semver';
import styled from 'styled-components';

import {TOOLTIP_DELAY} from '@constants/constants';
import {FeedbackTooltip, PluginDrawerTooltip, SettingsTooltip} from '@constants/tooltips';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPluginsDrawer} from '@redux/reducers/extension';
import {
  cancelWalkthrough,
  handleWalkthroughStep,
  openAboutModal,
  openKeyboardShortcutsModal,
  openReleaseNotesDrawer,
  toggleSettings,
} from '@redux/reducers/ui';

import {StepEnum} from '@shared/models/walkthrough';
import {AnimationDurations} from '@shared/styles';
import {Colors} from '@shared/styles/colors';
import {openDiscord, openDocumentation, openFeedback, openGitHub} from '@shared/utils/shell';

import {useAppVersion} from '../useAppVersion';

export function useHelpMenuItems() {
  const dispatch = useAppDispatch();
  const isInQuickClusterMode = useAppSelector(state => state.ui.isInQuickClusterMode);

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
        label: (
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SettingsTooltip}>
            {renderMenuItem('Settings', <SettingOutlined />, true)}
          </Tooltip>
        ),
        key: 'settings',
        onClick: () => dispatch(toggleSettings()),
      },
      ...(!isInQuickClusterMode
        ? [
            {
              label: (
                <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={PluginDrawerTooltip}>
                  {renderMenuItem('Plugins Manager', <ApiOutlined />, true)}
                </Tooltip>
              ),
              key: 'plugins-manager',
              onClick: () => dispatch(openPluginsDrawer()),
            },
          ]
        : []),
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
              {!isInQuickClusterMode && (
                <HelpLink
                  type="link"
                  size="small"
                  onClick={() => {
                    dispatch(cancelWalkthrough('novice'));
                    dispatch(handleWalkthroughStep({step: StepEnum.Next, collection: 'novice'}));
                  }}
                >
                  Re-play Quick Guide
                </HelpLink>
              )}
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
          <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FeedbackTooltip}>
            {renderMenuItem('Feedback', <CommentOutlined />)}
          </Tooltip>
        ),
        key: 'feedback',
        onClick: () => openFeedback(),
      },
    ],
    [dispatch, parsedAppVersion, isInQuickClusterMode]
  );

  return items;
}

const renderMenuItem = (label: string, icon: JSX.Element, border?: boolean) => (
  <MenuItem $border={border}>
    {icon && <MenuItemIcon>{icon}</MenuItemIcon>}
    <MenuItemLabel>{label}</MenuItemLabel>
  </MenuItem>
);

// StyledComponents

const HelpLink = styled(Button)`
  color: ${Colors.grey9};
`;

const MenuItem = styled.div<{$border?: boolean}>`
  background-color: transparent;
  color: ${Colors.grey9};
  font-weight: 700;
  font-size: 14px;
  height: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0px 12px;
  transition: all ${AnimationDurations.fast} ease-in;

  &:hover {
    opacity: 0.8;
  }

  ${({$border}) => {
    if ($border) {
      return `border-bottom: 1px solid ${Colors.grey5b}`;
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
  padding-left: 37px;
  padding-bottom: 0.5rem;
  margin-top: -0.5rem;
  border-bottom: 1px solid ${Colors.grey5b};
`;
