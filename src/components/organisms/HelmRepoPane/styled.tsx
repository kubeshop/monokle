import {
  Checkbox as AntCheckbox,
  Input as AntInput,
  Menu as AntMenu,
  Table as AntTable,
  Button,
  Form,
  Typography,
} from 'antd';

import styled from 'styled-components';

import {Icon} from '@monokle/components';
import {Colors} from '@shared/styles';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 12px 12px 16px;
  overflow: hidden;
  height: 100%;
  place-content: start;
  background-color: ${Colors.grey10};
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
  &.ant-menu-horizontal > .ant-menu-item {
    color: ${Colors.grey7};
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    padding-bottom: 8px;
  }

  &.ant-menu-horizontal > .ant-menu-item:hover {
    color: ${Colors.geekblue8};
  }
  &.ant-menu-horizontal > .ant-menu-item:hover::after {
    border-bottom: 2px solid ${Colors.geekblue8};
  }

  &.ant-menu-horizontal > .ant-menu-item-selected {
    color: ${Colors.grey9};
  }

  &.ant-menu-horizontal > .ant-menu-item-selected::after {
    border-bottom: 2px solid ${Colors.grey9};
  }
`;

export const Title = styled(Typography.Text)`
  font-weight: 700;
  font-size: 24px;
  line-height: 22px;
  color: ${Colors.grey9};
  margin-right: 20px;
  margin-bottom: 38px;
`;

export const Link = styled(Typography.Text)`
  &.ant-typography {
    color: ${Colors.geekblue8} !important;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    border-bottom: 1px dashed ${Colors.geekblue8};
  }
`;

export const Table = styled(props => <AntTable {...props} />)`
  .ant-table {
    border: 1px solid ${Colors.grey4};
    border-radius: 2px;
  }

  .ant-table-header {
    background-color: #1f2628;
    color: ${Colors.grey9};
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
    background-color: #191f21;
    border-bottom: 1px solid ${Colors.grey4};
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    color: ${Colors.grey9};
  }

  .ant-table-body .ant-table-row:hover {
    background-color: #2a3437;
  }

  .ant-table-body .ant-table-row:hover .hover-area {
    visibility: visible;
  }

  .row-selected {
    background-color: ${Colors.cyan8} !important;
    color: ${Colors.grey2} !important;
  }

  .hub-search {
    color: ${Colors.geekblue8} !important;
  }
`;

export const HoverArea = styled.div.attrs({
  className: 'hover-area',
})`
  display: flex;
  align-items: center;
  visibility: hidden;
`;

export const Input = styled(AntInput)`
  align-self: flex-start;
  width: unset;
  min-width: 400px;
`;

export const HighlightedIcon = styled(Icon)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-bottom: 8px;
  background: ${Colors.geekblue7};
  svg {
    width: 18px;
    height: 18px;
    color: ${Colors.cyan9};
  }
`;

export const DescriptionContainer = styled.div`
  ul > li {
    font-size: 14px;
    line-height: 24px;
    width: max-content;
  }
`;

export const DescriptionTitle = styled(Typography.Text)`
  font-size: 14px;
  line-height: 24px;
  font-weight: 700;
`;

export const DeleteButton = styled(Button)`
  &.ant-btn-text:hover {
    background-color: transparent !important;
  }
`;

export const FormItem = styled(Form.Item)`
  &.ant-form-item {
    width: min(30%, 400px);
  }
`;

export const ErrorText = styled(Typography.Text)`
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: ${Colors.red6};
`;

export const Checkbox = styled(AntCheckbox)`
  .ant-checkbox + span {
    text-decoration-style: dashed;
    text-decoration-line: underline;
    text-underline-offset: 10px;
  }
`;
