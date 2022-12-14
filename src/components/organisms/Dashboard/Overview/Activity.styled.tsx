import styled from 'styled-components';

import {Colors} from '@shared/styles/colors';

export const Container = styled.div`
  padding: 12px 8px 3px 8px;
  overflow-y: auto;
`;

export const EventRow = styled.div<{$type: string}>`
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  border: 1px solid ${Colors.grey4};
  margin-bottom: 10px;
  padding: 10px;
  ${props =>
    `border-left: 4px solid ${
      (props.$type === 'Warning' && Colors.yellow12) ||
      (props.$type === 'Error' && Colors.red7) ||
      (props.$type === 'Normal' && Colors.grey5000)
    };`}
  :hover {
    background-color: ${Colors.grey10};
  }
`;

export const TimeInfo = styled.div`
  flex: 4;
  display: flex;
  flex-direction: column;
  display: flex;
  justify-content: center;
`;

export const MessageInfo = styled.div`
  flex: 12;
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  display: flex;
  justify-content: center;
`;

export const NamespaceInfo = styled.div`
  flex: 3;
  font-size: 12px;
  color: ${Colors.whitePure};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MessageTime = styled.div`
  font-size: 12px;
  color: ${Colors.grey8};
`;

export const MessageCount = styled.div`
  font-size: 11px;
  color: ${Colors.grey6};
`;

export const MessageText = styled.div`
  font-size: 12px;
  color: ${Colors.whitePure};
  overflow-wrap: break-word;
  text-overflow: ellipsis;
  word-break: break-word;
`;

export const MessageHost = styled.div`
  font-size: 11px;
  color: ${Colors.blue7};
`;
