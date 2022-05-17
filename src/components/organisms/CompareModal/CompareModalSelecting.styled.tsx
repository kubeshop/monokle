import {Row} from 'antd';

import styled from 'styled-components';

export const ListRow = styled(Row)`
  margin-right: -23px;
  overflow: auto;
`;

export const FloatingFigure = styled.div<{side: 'left' | 'right'; noEvents?: boolean}>`
  position: absolute;
  ${({side}) => (side === 'left' ? 'left: 0;' : 'right: 0;')}
  top: 72px;
  width: 45%;
  height: calc(100% - 72px);
  overflow: hidden;
  pointer-events: ${props => (props.noEvents ? 'none' : 'auto')};
`;

export const RetrySpan = styled.span`
  text-decoration: underline;
  cursor: pointer;
`;
