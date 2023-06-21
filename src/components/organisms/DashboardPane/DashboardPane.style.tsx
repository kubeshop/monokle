import {Button as RawButton, Collapse as RawCollapse, Input as RawInput} from 'antd';

import {
  CheckCircleFilled as RawCheckCircleFilled,
  DownOutlined as RawDownOutlined,
  FilterOutlined as RawFilterOutlined,
  SearchOutlined as RawSearchOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

import {TitleBar} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  padding: 16px 0px 16px 0;

  .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
    overflow-y: auto;
  }
`;

export const HeaderContainer = styled.div``;

export const MainSection = styled.div<{$active: boolean; $clickable: boolean; $isHovered: boolean}>`
  padding: 0 0 0 16px;
  font-size: 16px;
  line-height: 36px;
  font-weight: 600;

  /* ${props =>
    props.$clickable &&
    `
    :hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: ${Colors.grey9};
    }
  `} */

  ${props => `
    color: ${props.$active ? Colors.grey2 : Colors.whitePure};
    background-color: ${props.$active ? Colors.blue9 : 'transparent'};
    cursor:${props.$clickable ? 'pointer' : 'inherit'};`}

  ${props => {
    if (props.$active) {
      if (props.$isHovered && props.$clickable) {
        return `background: ${Colors.selectionColorHover};`;
      }
      return `background: ${Colors.selectionColor};font-weight: 700;`;
    }
    if (props.$isHovered && props.$clickable) {
      return `background: ${Colors.blackPearl};`;
    }
  }};

  ${props => {
    if (props.$active) {
      return `font-weight: 700;`;
    }
  }};
  ${props => {
    if (props.$active) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.whitePure};`;
  }};
`;
export const SubSection = styled.div<{$active: boolean; $isHovered: boolean}>`
  padding: 0 0 0 16px;
  font-size: 14px;
  line-height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;

  ${props => {
    if (props.$active) {
      if (props.$isHovered) {
        return `background: ${Colors.selectionColorHover};`;
      }
      return `background: ${Colors.selectionColor};font-weight: 700;`;
    }
    if (props.$isHovered) {
      return `background: ${Colors.blackPearl};`;
    }
  }};

  ${props => {
    if (props.$active) {
      return `font-weight: 700;`;
    }
  }};
  ${props => {
    if (props.$active) {
      return `color: ${Colors.blackPure};`;
    }
    return `color: ${Colors.grey9};`;
  }};
`;

export const ClusterName = styled(TitleBar)`
  & > div:first-child {
    font-size: 14px;
    color: ${Colors.whitePure};
  }
`;

export const CheckCircleFilled = styled(RawCheckCircleFilled)`
  color: ${Colors.polarGreen};
  margin-right: 4px;
`;

export const ConnectedText = styled.span`
  color: ${Colors.polarGreen};
  font-weight: 600;
  font-size: 10px;
`;

export const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  grid-area: filter;
`;

export const Input = styled(RawInput)`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  border: none;
`;
export const SearchOutlined = styled(RawSearchOutlined)`
  color: ${Colors.grey6};
`;

export const DownOutlined = styled(RawDownOutlined)``;

export const FilterAction = styled(RawButton)`
  border: none;
`;

export const FilterOutlined = styled(RawFilterOutlined)`
  color: ${Colors.blue7};
`;

export const Collapse = styled(RawCollapse)`
  padding-top: 18px;
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 14px !important;
  overflow: hidden;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;

  .ant-collapse-header {
    padding: 2px 20px 0px 20px !important;
  }
  .ant-collapse-item .ant-collapse-header-collapsible-only .ant-collapse-header-text {
    width: 100%;
  }
`;

export const CollapseContainer = styled.div`
  width: 100%;
  height: 100%;
`;
