import styled from 'styled-components';

import {BackgroundColors} from '@styles/Colors';

const PaneContainer = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  width: 100%;
  margin: 0px;
  padding: 0px 2px 0px 2px;
  overflow-y: scroll;
  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

export default PaneContainer;
