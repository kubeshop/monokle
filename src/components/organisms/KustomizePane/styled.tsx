import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const KustomizePaneContainer = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: max-content 1fr;
`;

export const List = styled.ol`
  height: 100%;
  list-style-type: none;
  padding: 0;
  padding-bottom: 20px;
  overflow-y: auto;
  margin: 0;
  ${GlobalScrollbarStyle}
`;
