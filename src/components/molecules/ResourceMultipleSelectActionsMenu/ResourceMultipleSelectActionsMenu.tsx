import React from 'react';

import {Menu} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const StyledMenu = styled(Menu)`
  background: linear-gradient(90deg, #112a45 0%, #111d2c 100%);
  color: ${Colors.blue6};
`;

const ResourceMultipleSelectActionsMenu: React.FC = () => {
  return (
    <StyledMenu mode="horizontal">
      <Menu.Item style={{color: Colors.red7}} key="delete">
        Delete
      </Menu.Item>

      <Menu.Item style={{marginLeft: 'auto'}} key="deselect">
        Deselect
      </Menu.Item>
    </StyledMenu>
  );
};

export default ResourceMultipleSelectActionsMenu;
