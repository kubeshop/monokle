import {Tabs as AntTabs, Drawer as RawDrawer, Typography} from 'antd';

import styled from 'styled-components';

import {IconButton} from '@monokle/components';
import {Colors} from '@shared/styles';

export const Drawer = styled(RawDrawer)`
  & .ant-drawer-content-wrapper {
    width: calc(100vw - 34%) !important;
  }
  & .ant-drawer-content {
    background: ${Colors.grey1};
  }
  z-index: 1000;

  & .ant-drawer-close {
    position: absolute;
    right: 0px;
  }

  & .ant-drawer-extra {
    margin-right: 20px;
  }

  & .ant-drawer-header {
    border-bottom: none;
  }

  & .ant-drawer-body {
    overflow: hidden;
    padding: 0;
  }
`;

export const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 34%;
  right: 0;
  z-index: 10;
  background: ${Colors.grey1};
  border-left: 1px solid ${Colors.grey4};
`;

export const Content = styled.div`
  position: relative;
  height: 100%;
`;

export const Header = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  padding-bottom: 0;
`;

export const Title = styled(Typography.Text)`
  font-size: 16px;
  line-height: 18px;
  font-weight: 700;
  color: ${Colors.grey9};
`;

export const CloseButton = styled(IconButton)`
  background-color: unset;

  :hover {
    background-color: unset;
  }
`;

export const Tabs = styled(props => <AntTabs {...props} />)`
  height: calc(100vh - 200px);

  .ant-tabs-content-holder {
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
    padding: 0px 28px;
  }

  &.ant-tabs > .ant-tabs-nav > .ant-tabs-nav-wrap {
    padding: 0px 28px !important;
  }

  .ant-tabs-content {
    position: unset;
    margin-bottom: 36px;
  }
`;

export const Footer = styled.div`
  height: 75px;

  display: flex;
  gap: 16px;
  border-top: 1px solid ${Colors.grey4};
  padding: 20px 28px;
  margin-top: 12px;
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
