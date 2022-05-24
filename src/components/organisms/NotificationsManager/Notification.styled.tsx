import {Badge} from 'antd';

import {CopyOutlined as RawCopyOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {AlertEnum} from '@models/alert';

import Colors from '@styles/Colors';

export const Span = styled.span`
  font-weight: 500;
  font-size: 12px;
  display: block;
  margin-bottom: 6px;
`;

export const CopyOutlined = styled(RawCopyOutlined)`
  margin-right: 8px;
  margin-top: 4px;
`;

export const DateSpan = styled(Span)`
  color: ${Colors.grey500};
`;

export const MessageBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const MessageContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const MessageSpan = styled(Span)`
  color: ${Colors.whitePure};
  width: 100%;
  margin-bottom: 0px;
`;

export const NotificationContainer = styled.div<{$isNew: boolean; $type: AlertEnum}>`
  padding: 5px 15px;
  margin-bottom: 4px;
  transition: background-color 1000ms linear;

  ${({$isNew, $type}) => {
    if ($isNew) {
      if ($type === AlertEnum.Success) {
        return `background-color: ${Colors.okayBg};`;
      }

      if ($type === AlertEnum.Error) {
        return `background-color: ${Colors.errorBg}`;
      }
    }
  }};
`;

export const StatusBadge = styled(Badge)`
  margin-right: 8px;
  margin-top: 4px;
`;

export const TitleSpan = styled(Span)`
  color: ${Colors.whitePure};
  width: 100%;
  font-size: 14px;
  font-weight: 600;
`;
