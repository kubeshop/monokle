import {Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  gap: 20px;
`;

export const Logo = styled.img`
  width: 100px;
  height: 100px;
  object-fit: contain;
  object-position: center;
`;

export const Label = styled(Typography.Text)`
  color: ${Colors.grey8};
`;

export const ChartInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Content = styled.div`
  overflow: auto;
  min-height: 0;
  max-height: calc(100vh - 292px);
`;

export const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75px;

  display: flex;
  gap: 16px;
  border-top: 1px solid ${Colors.grey4};
  padding: 20px 28px;

  .ant-space-compact-block {
    width: unset;
  }
`;

export const MenuDropdownList = styled.div`
  position: absolute;

  ul {
    overflow: overlay;
    min-width: 100px;
    max-height: 200px;
    min-height: 0;
  }

  ul::-webkit-scrollbar {
    width: 8px;
    transition: 0.3s;
  }

  ul::-webkit-scrollbar-thumb {
    border-radius: 4px;
  }

  .ant-dropdown-menu {
    background-color: ${Colors.grey2};
    overflow-x: hidden;
    box-shadow: none;
    min-width: max-content;
  }
  .ant-dropdown-menu-item {
    height: 24px;
  }

  .ant-dropdown-menu-item:hover {
    background-color: ${Colors.grey3};
  }
`;

export const H1 = styled(Typography.Text)`
  font-size: 16px;
  font-weight: bold;
`;

export const H2 = styled(Typography.Text)`
  font-size: 14px;
  font-weight: bold;
`;
