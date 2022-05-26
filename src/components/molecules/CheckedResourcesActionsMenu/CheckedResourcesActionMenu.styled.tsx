import {Menu as RawMenu} from 'antd';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Menu = styled(RawMenu)`
  background: linear-gradient(90deg, #112a45 0%, #111d2c 100%);
  color: ${Colors.blue6};
  height: 40px;
  line-height: 1.57;
  display: flex;
  align-items: center;
  border-bottom: none;

  & .ant-menu-item {
    padding: 0 12px !important;
  }

  & .ant-menu-item::after {
    border-bottom: none !important;
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
