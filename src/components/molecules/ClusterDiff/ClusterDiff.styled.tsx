import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const TitleBar = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  width: 100%;
  height: 40px;
  margin: 0;
  padding: 0;
  margin-left: 8px;
`;

export const TitleBarRightButtons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

export const List = styled.ol<{height?: number}>`
  list-style-type: none;
  padding: 0;
  overflow-y: auto;
  ${GlobalScrollbarStyle}

  ${props => props.height && `height: ${props.height}px;`}
  padding-bottom: 20px;
`;
