import {Col, Dropdown, Menu, Row} from 'antd';

import {FileSearchOutlined, GithubOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';

import {FontColors} from '@styles/Colors';

const IconContainerSpan = styled.span`
  color: ${FontColors.elementSelectTitle};
  padding-top: 10px;
  padding-right: 10px;
  font-size: 1.5em;
  cursor: pointer;
`;

const LabelContainer = styled(Col)`
  padding: 0 25px 0 0;
  display: flex;
  display: flex;
  align-content: center;
`;

const HelpMenu = () => {
  const menu = (
    <Menu inlineIndent={25}>
      <Menu.Item onClick={openDocumentation}>
        <Row justify="center">
          <Col span={8}>
            <IconContainerSpan>
              <FileSearchOutlined size={24} />
            </IconContainerSpan>
          </Col>
          <LabelContainer span={16}>Documentation</LabelContainer>
        </Row>
      </Menu.Item>
      <Menu.Item onClick={openGitHub}>
        <Row justify="center">
          <Col span={8}>
            <IconContainerSpan>
              <GithubOutlined size={24} />
            </IconContainerSpan>
          </Col>
          <LabelContainer span={16}>GitHub</LabelContainer>
        </Row>
      </Menu.Item>
      <Menu.Item onClick={openDiscord}>
        <Row justify="center">
          <Col span={8}>
            <IconContainerSpan>
              <img src={DiscordLogo} style={{height: '24px', cursor: 'pointer', marginBottom: '4px'}} />
            </IconContainerSpan>
          </Col>
          <LabelContainer span={16}>Discord</LabelContainer>
        </Row>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown key="more" overlay={menu}>
      <IconContainerSpan>
        <QuestionCircleOutlined size={24} />
      </IconContainerSpan>
    </Dropdown>
  );
};

export default HelpMenu;
