import {Tag} from 'antd';

import styled from 'styled-components';

import Colors, {FontColors} from '@styles/Colors';

export const ResourceListDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: scroll;
`;

export const HeaderDiv = styled.div<{$showCheckbox: boolean}>`
  height: 28px;
  margin-left: ${props => (props.$showCheckbox ? '32px' : 0)};
  font-size: 16px;
`;

export const Header = styled.h1`
  padding: 0;
  margin-bottom: 0px;
  font-size: 18px;
  line-height: 22px;
`;

export const ResourceCount = styled.span`
  margin-left: 6px;
  font-size: 14px;
  color: ${FontColors.grey};
`;

export const ResourceDiv = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
`;

export const ResourceNamespace = styled(Tag)`
  height: 22px;
  margin: 1px 8px 1px 0px;
  width: 72px;
  text-align: center;
  color: ${Colors.whitePure};
  font-size: 12px;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ResourceName = styled.span<{$isActive?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5b)};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
