import {DownCircleFilled as RawDownCircleFilled} from '@ant-design/icons';

import styled from 'styled-components';

export const DownCircleFilled = styled(RawDownCircleFilled)`
  font-size: 16px;
  cursor: pointer;
`;

export const TerminalContainer = styled.div`
  background-color: red;
  width: 100%;
  height: 100%;
`;

export const TerminalPaneContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
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
