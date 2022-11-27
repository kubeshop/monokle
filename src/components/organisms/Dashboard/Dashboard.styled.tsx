import styled from 'styled-components';

import Colors from '@styles/Colors';

import {Header as RawHeader} from './Header/Header';

export const Container = styled.div<{$paneHeight: number}>`
  background-color: ${Colors.black100};
  display: grid;
  width: 100%;
  height: 100%;
  row-gap: 8px;
  grid-template-columns: 1fr;
  grid-template-rows: 70px calc(100% - 78px);
  grid-template-areas:
    'header header'
    'content content';
`;

export const Header = styled(RawHeader)`
  grid-area: header;
`;

export const Content = styled.div`
  grid-area: content;
`;
