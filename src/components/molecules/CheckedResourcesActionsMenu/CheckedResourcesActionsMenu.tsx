import React from 'react';

import {Menu} from 'antd';

import styled from 'styled-components';

import {useAppDispatch} from '@redux/hooks';
import {uncheckAllResourceIds} from '@redux/reducers/main';

import Colors from '@styles/Colors';

const StyledMenu = styled(Menu)`
  background: linear-gradient(90deg, #112a45 0%, #111d2c 100%);
  color: ${Colors.blue6};
  height: 40px;
  line-height: 1.57;
  display: flex;
  align-items: center;
`;

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <StyledMenu mode="horizontal">
      <Menu.Item style={{color: Colors.red7}} key="delete">
        Delete
      </Menu.Item>

      <Menu.Item style={{marginLeft: 'auto'}} key="deselect" onClick={() => dispatch(uncheckAllResourceIds())}>
        Deselect
      </Menu.Item>
    </StyledMenu>
  );
};

export default CheckedResourcesActionsMenu;
