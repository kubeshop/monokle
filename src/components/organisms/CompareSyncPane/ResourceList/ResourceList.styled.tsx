import {Tag} from 'antd';

import styled from 'styled-components';

import {Colors, FontColors} from '@shared/styles/colors';

export const ApiVersionGroup = styled.span`
  font-size: 12px;
  color: ${Colors.grey7};
  margin-left: 6px;
`;

export const ResourceListDiv = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: auto;
`;

export const HeaderDiv = styled.div<{$index: number; $showCheckbox: boolean}>`
  height: 28px;
  margin-left: ${props => (props.$showCheckbox ? '32px' : 0)};
  font-size: 16px;
  margin-top: ${props => (props.$index ? '20px' : 0)};
`;

export const Header = styled.h1`
  padding: 0;
  margin-bottom: 0px;
  font-size: 18px;
  line-height: 22px;
`;

export const ResourceCount = styled.span`
  margin-left: 8px;
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

export const ResourceNamespacePlaceholder = styled.div`
  height: 22px;
  width: 72px;
  margin-right: 8px;
`;

export const ResourceName = styled.span<{$isActive?: boolean}>`
  font-size: 14px;
  font-weight: 400;
  line-height: 25px;
  color: ${({$isActive = true}) => ($isActive ? Colors.whitePure : Colors.grey5)};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;
