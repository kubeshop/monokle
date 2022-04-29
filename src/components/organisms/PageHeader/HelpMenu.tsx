import {useMemo} from 'react';

import {Col, Dropdown, Menu, Row} from 'antd';

import {
  FileSearchOutlined,
  FireOutlined,
  GithubOutlined,
  MessageOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

import semver from 'semver';
import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {cancelWalkThrough, handleWalkThroughStep, openReleaseNotesDrawer} from '@redux/reducers/ui';

import {Icon} from '@components/atoms';
import {StepEnum} from '@components/molecules/WalkThrough/types';

import {useAppVersion} from '@hooks/useAppVersion';

import {openDiscord, openDocumentation, openGitHub, openKeyboardShortcuts} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';

import Colors, {FontColors} from '@styles/Colors';

const IconContainerSpan = styled.span`
  width: 18px;
  height: 18px;
  color: ${FontColors.elementSelectTitle};
  font-size: 18px;
  cursor: pointer;
`;

const StyledQuestionCircleOutlined = styled(QuestionCircleOutlined)`
  cursor: pointer;
  font-size: 20px;
  color: ${FontColors.elementSelectTitle};
`;

const MenuItem = styled(Menu.Item)`
  padding-right: 12px;
`;

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

  const menu = (
    <Menu inlineIndent={25} style={{width: '200px'}}>
      <MenuItem onClick={openDocumentation} key="documentation">
        <Row align="middle">
          <Col span={5}>
            <IconContainerSpan>
              <FileSearchOutlined />
            </IconContainerSpan>
          </Col>

          <Col span={19}>Documentation</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={onClickReleaseNotes} key="releasenotes">
        <Row align="middle">
          <Col span={5}>
            <IconContainerSpan>
              <FireOutlined />
            </IconContainerSpan>
          </Col>

          <Col span={19}>New in {parsedAppVersion || 'this version'}</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={openKeyboardShortcuts} key="hotkeys">
        <Row align="middle">
          <Col span={5}>
            <IconContainerSpan>
              <Icon name="shortcuts" color={Colors.blue6} />
            </IconContainerSpan>
          </Col>

          <Col span={19}>Keyboard Shortcuts</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={openGitHub} key="github">
        <Row align="middle">
          <Col span={5}>
            <IconContainerSpan>
              <GithubOutlined />
            </IconContainerSpan>
          </Col>

          <Col span={19}>GitHub</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={openDiscord} key="discord">
        <Row align="middle">
          <Col span={5}>
            <IconContainerSpan>
              <img src={DiscordLogo} style={{height: '18px', width: '18px'}} />
            </IconContainerSpan>
          </Col>

          <Col span={19}>Discord</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={() => {
        dispatch(cancelWalkThrough());
        dispatch(handleWalkThroughStep(StepEnum.Next));
        }} key="replay">
        <Row align="middle">
          <Col span={5}>
            <IconContainerSpan>
              <MessageOutlined style={{transform: 'rotate(180deg)'}} />
            </IconContainerSpan>
          </Col>

          <Col span={19}>Re-play Quick Guide</Col>
        </Row>
      </MenuItem>
    </Menu>
  );

  return (
    <Dropdown key="more" overlay={menu}>
      <StyledQuestionCircleOutlined />
    </Dropdown>
  );
};

export default HelpMenu;
