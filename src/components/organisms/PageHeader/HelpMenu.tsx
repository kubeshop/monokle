import {Col, Dropdown, Menu, Row} from 'antd';

import {FileSearchOutlined, GithubOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';

import {FontColors} from '@styles/Colors';

const IconContainerSpan = styled.span`
  color: ${FontColors.elementSelectTitle};
  font-size: 24px;
  cursor: pointer;
`;

const MenuItem = styled(Menu.Item)`
  padding-right: 20px;
`;

const HelpMenu = () => {
  const menu = (
    <Menu inlineIndent={25}>
      <MenuItem onClick={openDocumentation} key="documentation" style={{paddingRight: '20px'}}>
        <Row align="middle">
          <Col span={7}>
            <IconContainerSpan>
              <FileSearchOutlined />
            </IconContainerSpan>
          </Col>

          <Col span={17}>Documentation</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={openGitHub} key="github">
        <Row align="middle">
          <Col span={7}>
            <IconContainerSpan>
              <GithubOutlined />
            </IconContainerSpan>
          </Col>

          <Col span={17}>GitHub</Col>
        </Row>
      </MenuItem>

      <MenuItem onClick={openDiscord} key="discord">
        <Row align="middle">
          <Col span={7}>
            <IconContainerSpan>
              <img src={DiscordLogo} style={{height: '24px', width: '24px'}} />
            </IconContainerSpan>
          </Col>

          <Col span={17}>Discord</Col>
        </Row>
      </MenuItem>
    </Menu>
  );

  return (
    <Dropdown key="more" overlay={menu}>
      <IconContainerSpan>
        <QuestionCircleOutlined />
      </IconContainerSpan>
    </Dropdown>
  );
};

export default HelpMenu;
