import {Row} from 'antd';

import styled from 'styled-components';

export const ListRow = styled(Row)`
  height: 100%;
  margin-right: -23px;
  overflow: auto;
`;

export const FloatingFigure = styled.div<{side: 'left' | 'right'; noEvents?: boolean}>`
  position: absolute;
  ${({side}) => (side === 'left' ? 'left: 0;' : 'right: 0;')}
  top: 0px;
  width: 42%;
  height: 100%;
  overflow: hidden;
  pointer-events: ${props => (props.noEvents ? 'none' : 'auto')};
`;

export const RetrySpan = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;
