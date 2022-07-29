import {
  DeleteOutlined as RawDeleteOutlined,
  DownCircleFilled as RawDownCircleFilled,
  PlusOutlined as RawPlusOutlined,
} from '@ant-design/icons';

import styled from 'styled-components';

export const DeleteOutlined = styled(RawDeleteOutlined)`
  font-size: 16px;
  cursor: pointer;
`;

export const DownCircleFilled = styled(RawDownCircleFilled)`
  font-size: 16px;
  cursor: pointer;
`;

export const PlusOutlined = styled(RawPlusOutlined)`
  font-size: 16px;
  cursor: pointer;
`;

export const TerminalActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TerminalContainer = styled.div<{$height: number}>`
  width: 100%;
  height: ${({$height}) => $height}px;

  & .xterm {
    height: 100%;

    & .xterm-viewport {
      overflow-y: auto;
    }
  }
`;

export const TerminalPaneContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleLabel = styled.div`
  display: flex;
  align-items: center;
`;
