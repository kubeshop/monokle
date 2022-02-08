import styled from 'styled-components';

import {AppBorders} from '@styles/Borders';

export const EditorPane = styled.div`
  height: 100%;
  width: 100%;
`;

export const LeftPane = styled.div`
  height: 100%;
  width: 100%;
  border-right: ${AppBorders.sectionDivider};
`;

export const LeftPaneContainer = styled.div`
  height: 100%;
  border-right: ${AppBorders.sectionDivider};
  position: relative;
`;

export const NavPane = styled.div`
  height: 100%;
  width: 100%;
  border-right: ${AppBorders.sectionDivider};
`;

export const NavPaneContainer = styled.div`
  height: 100%;
  border-right: ${AppBorders.sectionDivider};
  position: relative;
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
    top: 50%;
    right: -5px;
    height: 100%;
    width: 10px;
    background-color: transparent;
    cursor: col-resize;
    transform: translateY(-50%);
  }
`;
