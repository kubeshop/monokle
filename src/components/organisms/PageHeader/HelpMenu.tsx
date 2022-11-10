import {shell} from 'electron';

import {useMemo} from 'react';

import {Tooltip} from 'antd';

import semver from 'semver';

import {TOOLTIP_DELAY} from '@constants/constants';
import {FeedbackTooltip, PluginDrawerTooltip, SettingsTooltip} from '@constants/tooltips';

import {useAppDispatch} from '@redux/hooks';
import {openPluginsDrawer} from '@redux/reducers/extension';
import {
  cancelWalkthrough,
  handleWalkthroughStep,
  openAboutModal,
  openKeyboardShortcutsModal,
  openReleaseNotesDrawer,
  toggleSettings,
} from '@redux/reducers/ui';

import {useAppVersion} from '@hooks/useAppVersion';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import {StepEnum} from '@monokle-desktop/shared';

import * as S from './HelpMenu.styled';

export const HelpMenu = ({onMenuClose}: {onMenuClose?: Function}) => {
  const dispatch = useAppDispatch();
  const appVersion = useAppVersion();

  const parsedAppVersion = useMemo(() => {
    const version = semver.parse(appVersion);
    if (!version) {
      return undefined;
    }
    return `${version.major}.${version.minor}`;
  }, [appVersion]);

  const onClickReleaseNotes = () => {
    dispatch(openReleaseNotesDrawer());
  };

  const openKeyboardShortcuts = () => {
    dispatch(openKeyboardShortcutsModal());
  };

  const toggleSettingsDrawer = () => {
    dispatch(toggleSettings());
  };

  const showPluginsDrawer = () => {
    dispatch(openPluginsDrawer());
  };

  const handleMenuClose = () => {
    if (onMenuClose) {
      onMenuClose();
    }
  };

  return (
    <S.MenuContainer id="menu-helpers">
      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={SettingsTooltip}>
        <S.MenuItem
          onClick={() => {
            toggleSettingsDrawer();
            handleMenuClose();
          }}
        >
          <S.MenuItemIcon>
            <S.SettingsOutlined />
          </S.MenuItemIcon>
          <S.MenuItemLabel>Settings</S.MenuItemLabel>
        </S.MenuItem>
      </Tooltip>

      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={PluginDrawerTooltip}>
        <S.MenuItem
          onClick={() => {
            showPluginsDrawer();
            handleMenuClose();
          }}
        >
          <S.MenuItemIcon>
            <S.ApiOutlined />
          </S.MenuItemIcon>
          <S.MenuItemLabel>Plugins Manager</S.MenuItemLabel>
        </S.MenuItem>
      </Tooltip>

      <S.MenuItem style={{borderBottom: 'none'}}>
        <S.MenuItemIcon>
          <S.QuestionCircleOutlined />
        </S.MenuItemIcon>
        <S.MenuItemLabel>Help</S.MenuItemLabel>
      </S.MenuItem>

      <S.MenuItemLinks>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            openKeyboardShortcuts();
            handleMenuClose();
          }}
        >
          Keyboard Shortcuts
        </S.HelpLink>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            openDocumentation();
            handleMenuClose();
          }}
        >
          Documentation
        </S.HelpLink>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            onClickReleaseNotes();
            handleMenuClose();
          }}
        >
          New in {parsedAppVersion || 'this version'}
        </S.HelpLink>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            dispatch(cancelWalkthrough('novice'));
            dispatch(handleWalkthroughStep({step: StepEnum.Next, collection: 'novice'}));
            handleMenuClose();
          }}
        >
          Re-play Quick Guide
        </S.HelpLink>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            openGitHub();
            handleMenuClose();
          }}
        >
          Github
        </S.HelpLink>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            openDiscord();
            handleMenuClose();
          }}
        >
          Discord
        </S.HelpLink>
        <S.HelpLink
          type="link"
          size="small"
          onClick={() => {
            dispatch(openAboutModal());
            handleMenuClose();
          }}
        >
          About Monokle
        </S.HelpLink>
      </S.MenuItemLinks>

      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={FeedbackTooltip}>
        <S.MenuItem
          onClick={() => {
            shell.openExternal('https://49x902y6r6t.typeform.com/to/vkFBEYYt');
            handleMenuClose();
          }}
        >
          <S.MenuItemIcon>
            <S.CommentOutlined />
          </S.MenuItemIcon>
          <S.MenuItemLabel>Feedback</S.MenuItemLabel>
        </S.MenuItem>
      </Tooltip>
    </S.MenuContainer>
  );
};
