import {useMemo} from 'react';

import {Col, Dropdown, Row} from 'antd';

import {FileSearchOutlined, FireOutlined, GithubOutlined, MessageOutlined} from '@ant-design/icons';

import semver from 'semver';

import {useAppDispatch} from '@redux/hooks';
import {
  cancelWalkThrough,
  handleWalkThroughStep,
  openKeyboardShortcutsModal,
  openReleaseNotesDrawer,
} from '@redux/reducers/ui';

import {Icon} from '@components/atoms';
import {StepEnum} from '@components/molecules/WalkThrough/types';

import {useAppVersion} from '@hooks/useAppVersion';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';

import Colors from '@styles/Colors';

import * as S from './HelpMenu.styled';

const HelpMenu = () => {
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

  const menuItems = [
    {
      key: 'documentation',
      label: (
        <Row align="middle">
          <Col span={5}>
            <S.IconContainerSpan>
              <FileSearchOutlined />
            </S.IconContainerSpan>
          </Col>
          <Col span={19}>Documentation</Col>
        </Row>
      ),
      onClick: openDocumentation,
    },
    {
      key: 'releasenotes',
      label: (
        <Row align="middle">
          <Col span={5}>
            <S.IconContainerSpan>
              <FireOutlined />
            </S.IconContainerSpan>
          </Col>
          <Col span={19}>New in {parsedAppVersion || 'this version'}</Col>
        </Row>
      ),
      onClick: onClickReleaseNotes,
    },
    {
      key: 'hotkeys',
      label: (
        <Row align="middle">
          <Col span={5}>
            <S.IconContainerSpan>
              <Icon name="shortcuts" color={Colors.blue6} />
            </S.IconContainerSpan>
          </Col>
          <Col span={19}>Keyboard Shortcuts</Col>
        </Row>
      ),
      onClick: openKeyboardShortcuts,
    },
    {
      key: 'github',
      label: (
        <Row align="middle">
          <Col span={5}>
            <S.IconContainerSpan>
              <GithubOutlined />
            </S.IconContainerSpan>
          </Col>
          <Col span={19}>GitHub</Col>
        </Row>
      ),
      onClick: openGitHub,
    },
    {
      key: 'discord',
      label: (
        <Row align="middle">
          <Col span={5}>
            <S.IconContainerSpan>
              <img src={DiscordLogo} style={{height: '18px', width: '18px'}} />
            </S.IconContainerSpan>
          </Col>
          <Col span={19}>Discord</Col>
        </Row>
      ),
      onClick: openDiscord,
    },
    {
      key: 'replay',
      label: (
        <Row align="middle">
          <Col span={5}>
            <S.IconContainerSpan>
              <MessageOutlined style={{transform: 'rotate(180deg)'}} />
            </S.IconContainerSpan>
          </Col>
          <Col span={19}>Re-play Quick Guide</Col>
        </Row>
      ),
      onClick: () => {
        dispatch(cancelWalkThrough('novice'));
        dispatch(handleWalkThroughStep({step: StepEnum.Next, collection: 'novice'}));
      },
    },
  ];

  return (
    <Dropdown key="more" overlay={<S.Menu items={menuItems} />}>
      <S.QuestionCircleOutlined />
    </Dropdown>
  );
};

export default HelpMenu;
