import {Menu, Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0 1rem;
  background: ${Colors.grey3b};
  border: none;
  min-width: fit-content;
`;

export const MenuContainer = styled.div`
  background-color: ${Colors.grey1};
  width: 280px;
  padding-bottom: 6px;

  .selected-menu-item {
    background-color: ${Colors.blue7};
  }
`;

export const MenuDropdownList = styled.div`
  position: relative;

  ul {
    overflow: overlay;
    height: 200px;
  }

  ul::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
    transition: 0.3s;
  }

  ul::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .ant-dropdown-menu {
    background-color: ${Colors.grey1};
    overflow-x: hidden;
    box-shadow: none;
  }
  .ant-dropdown-menu-item {
    height: 24px;
  }

  .ant-dropdown-menu-item:hover {
    background-color: ${Colors.grey2};
  }
`;

export const MenuBottom = styled.div`
  padding: 12px 20px 6px 12px;
`;

export const WarningText = styled(Typography.Text)`
  font-size: 12px;
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  font-family: 'Inter';
  color: ${Colors.grey8};
  line-height: 22px;
  overflow: hidden;

  .ant-typography.ant-typography-danger {
    color: ${Colors.red7};
  }
`;

export const K8sVersionText = styled(Typography.Text)`
  color: ${Colors.blue6};
`;

export const MenuItem = styled(Menu.Item)<{$selected: boolean}>`
  background-color: ${({$selected}) => ($selected ? Colors.blue7 : undefined)};
`;
