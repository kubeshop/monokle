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
  height: 31px;
  cursor: pointer;
`;

export const LogoContainer = styled.div<{$isNewVersionNoticeVisible: boolean}>`
  border-right: ${AppBorders.sectionDivider};
  width: 50px;
  padding-right: ${({$isNewVersionNoticeVisible}) => ($isNewVersionNoticeVisible ? '356px' : '0px')};
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
  gap: 20px;
`;

export const SearchItemLabel = styled.div.attrs({className: 'search-item-label'})`
  display: flex;
  & :first-child {
    width: 100px;
    color: ${Colors.grey7};
  }
`;

export const SearchContainer = styled.div`
  .selected-menu-item {
    background-color: ${Colors.blue7};
  }

  .selected-menu-item .search-item-label :first-child {
    color: ${Colors.whitePure};
  }
`;
