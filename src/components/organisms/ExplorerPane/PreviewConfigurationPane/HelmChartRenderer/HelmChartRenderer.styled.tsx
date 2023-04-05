import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const ItemContainer = styled.span`
  display: flex;
  align-items: center;
  width: 100%;
  user-select: none;
  > {
    min-width: 0;
  }
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 2px;
`;

export const ItemName = styled.div`
  padding: 2px 0;
  font-size: 14px;
  white-space: nowrap;
  color: ${Colors.grey9};
`;

export const PrefixContainer = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 7px;
`;

export const SuffixContainer = styled.span`
  min-width: 0;
  color: ${Colors.grey6};
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
`;
