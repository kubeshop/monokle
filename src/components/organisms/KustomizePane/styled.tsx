import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

export const KustomizePaneContainer = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: max-content 1fr;
`;

export const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  ${GlobalScrollbarStyle}
`;

export const List = styled.ol`
  list-style-type: none;
`;
