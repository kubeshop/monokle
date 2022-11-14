import styled from 'styled-components';

export const Container = styled.div`
  padding: 12px 8px;
`;

export const EventRow = styled.div<{$type: string}>`
  display: flex;
  justify-content: space-between;
  border-radius: 4px;
  border: 1px solid #303030;

  margin-bottom: 10px;
  padding: 10px;
  ${props =>
    `border-left: 4px solid ${
      (props.$type === 'Warning' && '#E8B339') ||
      (props.$type === 'Error' && '#E84749') ||
      (props.$type === 'Normal' && '#2A385A')
    };`}
`;

export const TimeInfo = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  display: flex;
  justify-content: center;
`;

export const MessageInfo = styled.div`
  flex: 3;
  margin: 0 20px;
  display: flex;
  flex-direction: column;
  display: flex;
  justify-content: center;
`;

export const NamespaceInfo = styled.div`
  flex: 1;
  font-size: 12px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MessageTime = styled.div`
  font-size: 12px;
  color: #acacac;
`;

export const MessageCount = styled.div`
  font-size: 11px;
  color: #5a5a5a;
`;
