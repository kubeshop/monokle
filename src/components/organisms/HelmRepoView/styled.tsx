import {Menu as AntMenu, Table as AntTable, Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const Container = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 56px 1fr;
  row-gap: 16px;
  padding: 12px 12px 12px 22px;
  overflow: hidden;
  height: 100%;
  place-content: start;
`;

export const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  height: 56px;
  border-radius: 4px;
  margin-left: -18px;
`;

export const Menu = styled(AntMenu)`
  &.ant-menu {
    width: 100%;
    background: unset;
  }

  &.ant-menu-horizontal {
    border-bottom: unset;
  }
  &.ant-menu-horizontal > .ant-menu-item-selected {
    color: ${Colors.whitePure};
  }

  &.ant-menu-horizontal > .ant-menu-item-selected::after {
    border-bottom: 2px solid ${Colors.whitePure};
  }
`;

export const Title = styled(Typography.Text)`
  font-size: 16px;
  line-height: 22px;
  font-weight: bold;
  color: ${Colors.whitePure};
`;

export const Table = styled(props => <AntTable {...props} />)`
  .ant-table {
    border: 1px solid ${Colors.grey4};
    border-radius: 2px;
  }

  .ant-table-header {
    background-color: ${Colors.grey2};
    color: ${Colors.grey9};
    text-transform: uppercase;
    font-size: 14px !important;
    font-weight: 700 !important;
    border-bottom: 1px solid ${Colors.grey4};
    margin-bottom: 0;
  }

  & .ant-table-header .ant-table-cell {
    font-size: 14px;
    font-weight: 700;
    color: ${Colors.grey9};
  }

  .ant-table-thead .ant-table-cell::before {
    display: none;
  }

  .ant-table-body .ant-table-row {
    background-color: ${Colors.grey1};
    border-bottom: 1px solid ${Colors.grey4};
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    color: ${Colors.grey9};
  }

  .ant-table-body .ant-table-row:hover {
    background-color: ${Colors.grey2};
  }

  .ant-table-body .ant-table-row:hover .hover-area {
    visibility: visible;
  }

  .row-selected {
    background-color: ${Colors.cyan8} !important;
    color: ${Colors.grey1} !important;
  }
`;

export const HoverArea = styled.div.attrs({
  className: 'hover-area',
})`
  display: flex;
  align-items: center;
  visibility: hidden;
`;
