import styled from 'styled-components';

import {GlobalScrollbarStyle} from '@utils/scrollbar';

import {BackgroundColors} from '@styles/Colors';

const PaneContainer = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  width: 100%;
  margin: 0px;
  overflow-y: scroll;
  ${GlobalScrollbarStyle}
`;

export default PaneContainer;
