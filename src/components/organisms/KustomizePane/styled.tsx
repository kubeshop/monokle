import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const KustomizePaneContainer = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: max-content 1fr;
  grid-row-gap: 3px;
  padding-bottom: 3px;
`;

export const List = styled.ol`
  height: 100%;
  list-style-type: none;
  padding: 0px;
  overflow-y: auto;

  ${GlobalScrollbarStyle}
`;
