import styled from 'styled-components';

import {Header as RawHeader} from '../Header/Header';

export const Container = styled.div`
  background-color: #0a0d0e;
  padding: 12px;
  display: grid;
  height: 100%;
  width: 100%;
  row-gap: 8px;
  grid-template-columns: 1fr;
  grid-template-rows: 6.5% 91.5%;
  grid-template-areas:
    'header header'
    'content content';
  overflow: hidden;
`;

export const Header = styled(RawHeader)`
  grid-area: header;
`;

export const Content = styled.div`
  grid-area: content;
`;
