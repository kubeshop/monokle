import {Badge, Button} from 'antd';

import styled from 'styled-components';

import {AppBorders} from '@shared/styles/borders';
import {Colors} from '@shared/styles/colors';

export const ActionsContainer = styled.div`
  margin-left: auto;
  display: flex;
  gap: 15px;

  .ant-badge-count {
    top: 3px;
    right: 3px;
  }
`;

export const BackToProjectButton = styled(Button)`
  color: ${Colors.grey9};
  border-color: ${Colors.grey9};
  display: flex;
  align-items: center;

  &:hover {
    color: ${Colors.grey8};
    border-color: ${Colors.grey8};
  }

  & .anticon-left {
    font-size: 10px !important;
  }
`;

export const LearnButton = styled(Button)<{$isActive: boolean}>`
  font-size: 16px;
  padding: 0px 10px;
  color: ${({$isActive}) => ($isActive ? Colors.geekblue9 : Colors.grey9)};
  font-weight: ${({$isActive}) => ($isActive ? '700' : '400')};

  &:active,
  &:focus {
    color: ${({$isActive}) => ($isActive ? Colors.geekblue9 : Colors.grey9)};
    font-weight: ${({$isActive}) => ($isActive ? '700' : '400')};
    background: transparent;
  }
`;

export const Logo = styled.img`
  height: 32px;
  cursor: pointer;
`;

export const LogoContainer = styled.div<{$isNewVersionNoticeVisible: boolean}>`
  width: 32px;
  padding-right: ${({$isNewVersionNoticeVisible}) => ($isNewVersionNoticeVisible ? '332px' : '0px')};
`;

export const NewVersionBadge = styled(Badge)`
  & .ant-badge-dot {
    background: ${Colors.geekblue7};
  }
`;

export const StartPageHeaderContainer = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding-right: 30px;
`;

export const SearchItemLabel = styled.div.attrs({className: 'search-item-label'})`
  display: flex;
  & :first-child {
    width: 100px;
    color: ${Colors.grey7};
  }
`;

export const SearchContainer = styled.div`
  padding-left: 16px;
  border-left: ${AppBorders.sectionDivider};

  .selected-menu-item {
    background-color: ${Colors.blue7};
  }

  .selected-menu-item .search-item-label :first-child {
    color: ${Colors.whitePure};
  }
`;
