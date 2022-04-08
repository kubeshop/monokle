import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';
import {PanelColors} from '@styles/Colors';

export const EditorPaneContainer = styled.div`
  height: 100%;
  border-left: ${AppBorders.sectionDivider};
  position: relative;
  margin-left: 1px;

  & .custom-modal-handle {
    left: -3px;
  }
`;

export const LeftPaneContainer = styled.div`
  height: 100%;
  border-right: ${AppBorders.sectionDivider};
  position: relative;

  & .custom-modal-handle {
    right: -3px;
  }
  background: ${PanelColors.toolBar};
`;

export const Pane = styled.div<{$height?: number}>`
  ${({$height}) => `
    height: ${$height ? `${$height}px` : '100%'};
  `};
  width: 100%;
`;

export const SplitViewContainer = styled.div<{$gridTemplateColumns: string}>`
  width: 100%;
  height: 100%;
  display: grid;

  ${({$gridTemplateColumns}) => `
    grid-template-columns: ${$gridTemplateColumns};
  `};

  & .custom-modal-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 5px;
    cursor: col-resize;
  }
`;
