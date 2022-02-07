import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const KustomizePaneContainer = styled.div`
  height: 100%;
  padding-bottom: 10px;
  display: grid;
  grid-template-rows: max-content 1fr;
  grid-row-gap: 10px;
`;

export const List = styled.ol`
  height: 100%;
  list-style-type: none;
  padding: 0px;
  overflow-y: auto;

  ${GlobalScrollbarStyle}
`;
