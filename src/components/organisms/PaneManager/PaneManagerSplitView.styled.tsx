import styled from 'styled-components';

import {PanelColors} from '@styles/Colors';

export const SplitViewContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const LeftPane = styled.div`
  position: relative;
  height: 100%;
  background: ${PanelColors.toolBar};
`;
