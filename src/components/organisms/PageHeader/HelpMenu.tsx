import {Dropdown, Menu} from 'antd';

import {FileSearchOutlined, GithubOutlined, QuestionCircleOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {openDiscord, openDocumentation, openGitHub} from '@utils/shell';

import DiscordLogo from '@assets/DiscordLogo.svg';

import {FontColors} from '@styles/Colors';

const IconContainerSpan = styled.span`
  color: ${FontColors.elementSelectTitle};
  padding-top: 10px;
  padding-right: 10px;
  font-size: 24px;
  cursor: pointer;
`;

const HelpMenu = () => {
  const menu = (
    <Menu>
      <Menu.Item onClick={openDocumentation}>
        <IconContainerSpan>
          <FileSearchOutlined size={24} />
        </IconContainerSpan>
        Documentation
      </Menu.Item>
      <Menu.Item onClick={openGitHub}>
        <IconContainerSpan>
          <GithubOutlined size={24} />
        </IconContainerSpan>
        GitHub
      </Menu.Item>
      <Menu.Item onClick={openDiscord}>
        <IconContainerSpan>
          <img src={DiscordLogo} style={{height: '24px', cursor: 'pointer', marginBottom: '4px'}} />
        </IconContainerSpan>
        Discord
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
