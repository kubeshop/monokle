import {CloseOutlined as RawCloseOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 12px 8px 3px 8px;
  overflow-y: auto;
  height: calc(100% - 32px);
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
  cursor: pointer;
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

export const ScrollToLatest = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  background: rgba(20, 26, 27, 0.9);
  height: 64px;
  display: flex;
  align-items: center;
  margin-left: 16px;
`;
export const ScrollToOldest = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(20, 26, 27, 0.9);
  height: 64px;
  display: flex;
  align-items: center;
  margin-left: 16px;
`;
export const CloseOutlined = styled(RawCloseOutlined)`
  color: ${Colors.grey8};
  font-size: 11px;
  padding: 4px;

  :hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;
