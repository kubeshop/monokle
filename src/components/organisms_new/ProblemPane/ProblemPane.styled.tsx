import styled from 'styled-components';

import {BackgroundColors} from '@shared/styles';

export const ProblemPaneContainer = styled.div`
  background-color: ${BackgroundColors.darkThemeBackground};
  height: 100%;
  padding: 10px 10px 25px 25px;
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  grid-gap: 15px;
`;
