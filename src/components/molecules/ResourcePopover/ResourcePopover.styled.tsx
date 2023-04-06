import {Divider as RawDivider, Typography} from 'antd';

import styled from 'styled-components';

import {Colors} from '@shared/styles';

export const PopoverContainer = styled.div`
  margin: 0;
  padding: 0 8px;
  height: 100%;
  width: 100%;
  min-width: 240px;
  max-height: 350px;
  overflow-y: auto;
`;

export const InfoContainer = styled.div`
  overflow-y: auto;
  max-height: 302px;
`;

export const PopoverTitle = styled(Typography.Text)`
  font-weight: 400;
  font-size: 14px;
  color: ${Colors.grey9};
  height: 48px;
  text-align: center;
`;

export const Divider = styled(RawDivider)`
  margin: 5px 0;
`;

export const InfoRow = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 32px;
`;

export const InfoTitle = styled.span`
  color: ${Colors.grey7};
  margin-right: 4px;
`;

export const InfoContent = styled.span`
  color: ${Colors.grey9};
`;

export const ValidationsContainer = styled.div`
  margin-top: 6px;

  & > div:first-child {
    margin-right: 12px;
  }
`;

export const ValidationContainer = styled.div`
  font-size: 12px;
  font-weight: 400;
  font-size: 14px;
  display: inline-block;
`;

export const ValidationColor = styled.div<{$type: 'error' | 'warning'}>`
  background: ${({$type}) => ($type === 'error' ? '#e84749' : '#E89A3C')};
  border-radius: 4px;
  width: 12px;
  height: 12px;
  display: inline-block;
  margin-right: 6px;
`;

export const ValidationCount = styled.span<{$type: 'error' | 'warning'}>`
  color: ${({$type}) => ($type === 'error' ? '#e84749' : '#E89A3C')};
  margin-right: 6px;
  text-align: center;
`;

export const ValidationText = styled.span`
  color: ${Colors.grey7};
`;
