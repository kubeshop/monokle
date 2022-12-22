import {Button, Menu, Skeleton as RawSkeleton} from 'antd';

import {RightOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const TemplatesPageContainer = styled.div`
  height: 100%;
  display: inline-block;
  margin: 40px;
  width: calc(100% - 80px);
  background: black;
`;

export const TemplateLeftSidebarWrapper = styled.div`
  width: 508px;
  height: 100%;
  display: inline-block;
  background: #1d1d1d;
  padding-top: 30px;
  padding-bottom: 30px;
`;

export const TemplateSidebarPreviewWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  float: right;
  gap: 10px;
  min-width: 60%;
  max-width: 60%;
  border-radius: 4px;
`;

export const Skeleton = styled(RawSkeleton)`
  margin: 20px;
  width: 90%;
`;

export const TemplatesListWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`;

export const TemplatesPageTitle = styled.h1`
  font-size: 16px;
  font-weight: 700;
  line-height: 22px;
  letter-spacing: 0;
  text-align: left;
  padding: 16px 24px;
  margin-bottom: 0;
  background: #131515;
  border-bottom: 1px solid #434343;
`;

export const Arrow = styled(RightOutlined)`
  font-size: 8px;
  cursor: pointer;
  width: 8px;
  align-self: center;
`;

export const Content = styled.div`
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const Form = styled.div`
  margin: 5px 28px;
`;

export const StyledMenu = styled(Menu)`
  width: 100%;
  background: transparent;
  color: #acacac;
  font-size: 13px;
  &.ant-menu.ant-menu-inline {
    border-right: 0;
    .ant-menu-item .ant-menu-item-icon {
      font-size: 13px;
    }
  }
  .ant-menu-submenu {
    .ant-menu-selected::after,
    .ant-menu-item-selected::after {
      opacity: 0;
      border: 0;
    }
    li {
      background: transparent;
      &.ant-menu-item {
        padding: 0 52px;
        margin: 0;
        height: 30px;
        line-height: 30px;
      }
      &.ant-menu-item-selected {
        background: #8dcff8;
        color: #1d1d1d;
      }
    }
    .ant-menu-submenu-title {
      padding: 0 52px;
      color: #acacac;
      .ant-menu-title-content {
        margin-left: 24px;
      }
    }
    .ant-menu-submenu-arrow {
      left: 32px;
      color: #acacac;
    }
    .ant-menu-sub {
      background: transparent;
      .ant-menu-title-content {
        margin-left: 0;
        font-size: 13px;
        &:first-child {
          padding-left: 14px;
        }
      }
    }
  }
`;

export const NumberOfTemplates = styled.span`
  position: absolute;
  left: 170px;
`;

export const NumberOfResources = styled.span`
  position: absolute;
  font-size: 13px;
  right: 64px;
  //float:right;
  width: 80px;
  text-align: left;
`;

export const TitleBarWrapper = styled.span`
  > div {
    margin: 0 28px;
  }
`;

export const SearchBox = styled.div`
  display: flex;
  margin: 12px 0;
  input {
    border-width: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

export const StyledButton = styled(Button)<{$isItemSelected: boolean}>`
  display: flex;
  justify-content: center;
  width: 32px;
  margin-left: 8px;
  ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`}
  border-width: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;

  &:hover {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`};
    ${({$isItemSelected}) => `border-color: ${$isItemSelected ? Colors.grey5b : Colors.lightSeaGreen};`}
  }

  &:focus {
    color: ${Colors.whitePure};
    ${({$isItemSelected}) => `background-color: ${$isItemSelected ? Colors.blue6 : Colors.grey6};`};
    border-color: transparent;
  }

  :nth-child(3) {
    span {
      transform: rotate(-90deg);
      position: absolute;
      top: 8px;
      left: 13px;
    }
  }
  span {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`;
