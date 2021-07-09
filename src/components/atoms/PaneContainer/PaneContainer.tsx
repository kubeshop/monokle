import styled from 'styled-components';

import {BackgroundColors} from '@styles/Colors';
import {AppBorders} from '@styles/Borders';

const PaneContainer = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  height 100%;
  width: 100%;
  margin: 0px;
  padding: 0px 2px 0px 2px;
  border-left: ${AppBorders.sectionDivider};
  border-right: ${AppBorders.sectionDivider};
`;

export default PaneContainer;
