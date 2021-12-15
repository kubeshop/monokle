import React from 'react';

import {Menu} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {uncheckAllResourceIds} from '@redux/reducers/main';

import Colors from '@styles/Colors';

const StyledMenu = styled(Menu)`
  background: linear-gradient(90deg, #112a45 0%, #111d2c 100%);
  color: ${Colors.blue6};
  height: 40px;
  line-height: 1.57;
  display: flex;
  align-items: center;

  & .ant-menu-item {
    padding: 0 12px !important;
  }

  & .ant-menu-item::after {
    left: 12px;
    right: 12px;
  }

  & li:first-child {
    color: ${Colors.grey7};
    cursor: default;
  }
`;

const CheckedResourcesActionsMenu: React.FC = () => {
  const dispatch = useAppDispatch();

  const checkedResourceIds = useAppSelector(state => state.main.checkedResourceIds);

  const deselectHandler = () => {
    dispatch(uncheckAllResourceIds());
  };

  return (
    <StyledMenu mode="horizontal">
      <Menu.Item disabled key="resources-selected">
        {checkedResourceIds.length} Selected
      </Menu.Item>
      <Menu.Item style={{color: Colors.red7}} key="delete">
        Delete
      </Menu.Item>
      <Menu.Item key="deploy">Deploy</Menu.Item>

      <Menu.Item style={{marginLeft: 'auto'}} key="deselect" onClick={deselectHandler}>
        <CloseOutlined />
      </Menu.Item>
    </StyledMenu>
  );
};

export default CheckedResourcesActionsMenu;
