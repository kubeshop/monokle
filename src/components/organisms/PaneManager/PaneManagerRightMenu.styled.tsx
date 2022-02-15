import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

export const Container = styled.div`
  height: 100%;
  width: 100%;
  padding-left: 4px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  border-left: ${AppBorders.pageDivider};
`;
