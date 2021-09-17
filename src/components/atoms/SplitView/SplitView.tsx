import React, {
  useState,
  useLayoutEffect,
  MouseEvent,
  TouchEvent,
  ReactElement,
  FunctionComponent,
  useEffect,
} from 'react';
import styled from 'styled-components';
import {AppBorders} from '@styles/Borders';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {setResetLayout, toggleLeftMenu, updatePaneConfiguration} from '@redux/reducers/ui';

const MIN_WIDTH = 150;
const MIN_LEFT_PANE_WIDTH = 300;
const SEPARATOR_WIDTH = 5; // width including hitbox

export type SplitViewProps = {
  contentWidth: number;
  left: ReactElement;
  hideLeft: boolean;
  nav: ReactElement;
  editor: ReactElement;
  right: ReactElement;
  hideRight: boolean;
  className?: string;
};

const StyledSplitView = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

export type DividerProps = {
  hide: boolean;
};
const StyledDivider = styled.div`
  width: 0px;
  height: 100%;
  margin: 1px;
  border-left: ${AppBorders.pageDivider};
`;
const StyledDividerHitBox = styled.div.attrs((props: DividerProps) => props)`
  cursor: col-resize;
  align-self: stretch;
  display: ${props => (props.hide ? 'none' : 'flex')};
  align-items: center;
  padding: 0 1px;
`;

const StyledPaneDiv = styled.div`
  height: 100%;
`;

const Pane: FunctionComponent<{
  width: number;
  hide: boolean;
}> = ({children, width, hide}) => {
  return <StyledPaneDiv style={{display: hide ? 'none' : 'inline-block', width}}>{children}</StyledPaneDiv>;
};

const SplitView: FunctionComponent<SplitViewProps> = ({
  contentWidth,
  left,
  hideLeft,
  nav,
  editor,
  right,
  hideRight,
}) => {
  // check if the width changes for rerendering on window resizes.
  const [viewWidth, setViewWidth] = useState<number>(contentWidth);
  if (viewWidth !== contentWidth) {
    setViewWidth(contentWidth);
  }

  // panes enabled
  // const [leftHidden, setLeftHidden] = useState<boolean>(hideLeft);
  // const [rightHidden, setRightHidden] = useState<boolean>(hideRight);

  const numSeparatorsActive = 1 + (hideLeft ? 0 : 1) + (hideRight ? 0 : 1);
  const splitPaneWidth = viewWidth - numSeparatorsActive * SEPARATOR_WIDTH;

  // pane widths
  const [leftWidth, setLeftWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.leftWidth));
  const [navWidth, setNavWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.navWidth));
  const [editWidth, setEditWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.editWidth));
  const [rightWidth, setRightWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.rightWidth));
  const resetLayout = useAppSelector(state => state.ui.resetLayout);

  const dispatch = useAppDispatch();

  const normalizePaneWidths = (paneWidths: any, state: string) => {
    let totalWidth: number = 0;
    if (state === 'oo') {
      totalWidth = paneWidths.left + paneWidths.nav + paneWidths.edit + paneWidths.right;
    }
    if (state === 'cc') {
      totalWidth = paneWidths.nav + paneWidths.edit;
    }
    if (state === 'oc') {
      totalWidth = paneWidths.left + paneWidths.nav + paneWidths.edit;
    }
    if (state === 'co') {
      totalWidth = paneWidths.nav + paneWidths.edit + paneWidths.right;
    }

    return {
      left: splitPaneWidth * paneWidths.left * (1 / totalWidth),
      nav: splitPaneWidth * paneWidths.nav * (1 / totalWidth),
      edit: splitPaneWidth * paneWidths.edit * (1 / totalWidth),
      right: splitPaneWidth * paneWidths.right * (1 / totalWidth),
    };
  };

  useEffect(() => {
    if (!resetLayout) {
      return;
    }

    /*
      Possible configurations (left, right) -> left: 25%, nav: 25%, edit:25%, right:25%
      cc: closed, closed -> left: 0%, nav: 50%, edit:50%, right:0% (default)
      oc: open, closed -> left: 33%, nav: 33%, edit:33%, right:0%
      co: closed, open -> left: 0%, nav: 33%, edit:33%, right:33%
      oo: open, open -> left: 25%, nav: 25%, edit:25%, right:25%
    */
    const cfg = hideLeft && hideRight ? 'cc' : !hideLeft && hideRight ? 'oc' : hideLeft && !hideRight ? 'co' : 'oo';

    let sizes = {
      left: leftWidth,
      nav: rightWidth,
      edit: editWidth,
      right: rightWidth,
    };

    sizes = normalizePaneWidths(sizes, cfg);

    setLeftWidth(sizes.left / viewWidth);
    setNavWidth(sizes.nav / viewWidth);
    setEditWidth(sizes.edit / viewWidth);
    setRightWidth(sizes.right / viewWidth);

    dispatch(setResetLayout(true));
  }, [resetLayout]);

  // separator positions
  const [separatorLeftNavXPosition, setSeparatorLeftNavXPosition] = useState<number>(
    leftWidth * splitPaneWidth || splitPaneWidth * 0.25
  );
  const [separatorNavEditXPosition, setSeparatorNavEditXPosition] = useState<number>(
    (leftWidth + navWidth) * splitPaneWidth + SEPARATOR_WIDTH || splitPaneWidth * 0.5
  );
  const [separatorEditRightXPosition, setSeparatorEditRightXPosition] = useState<number>(
    (leftWidth + navWidth + editWidth) * splitPaneWidth + SEPARATOR_WIDTH * 2 || splitPaneWidth * 0.75
  );

  // drag statuses
  const [draggingLeftNav, setDraggingLeftNav] = useState(false);
  const [draggingNavEdit, setDraggingNavEdit] = useState(false);
  const [draggingEditRight, setDraggingEditRight] = useState(false);

  const onMouseDownLeftNav = (evt: MouseEvent<HTMLElement>): any => {
    setSeparatorLeftNavXPosition(evt.clientX);
    setDraggingLeftNav(true);
  };

  const onMouseDownNavEdit = (evt: MouseEvent<HTMLElement>): any => {
    setSeparatorNavEditXPosition(evt.clientX);
    setDraggingNavEdit(true);
  };

  const onMouseDownEditRight = (evt: MouseEvent<HTMLElement>): any => {
    setSeparatorEditRightXPosition(evt.clientX);
    setDraggingEditRight(true);
  };

  const onTouchStartLeftNav = (evt: TouchEvent<HTMLElement>): any => {
    setSeparatorLeftNavXPosition(evt.touches[0].clientX);
    setDraggingLeftNav(true);
  };

  const onTouchStartNavEdit = (evt: TouchEvent<HTMLElement>): any => {
    setSeparatorNavEditXPosition(evt.touches[0].clientX);
    setDraggingNavEdit(true);
  };

  const onTouchStartEditRight = (evt: TouchEvent<HTMLElement>): any => {
    setSeparatorEditRightXPosition(evt.touches[0].clientX);
    setDraggingEditRight(true);
  };

  const onMouseMove = (evt: MouseEvent<HTMLElement>): any => {
    evt.preventDefault();
    onMove(evt.clientX);
  };

  const onTouchMove = (evt: TouchEvent<HTMLElement>): any => {
    onMove(evt.touches[0].clientX);
  };

  const onMouseUp = () => {
    setDraggingLeftNav(false);
    setDraggingNavEdit(false);
    setDraggingEditRight(false);
    dispatch(
      updatePaneConfiguration({
        leftWidth,
        navWidth,
        editWidth,
        rightWidth,
        separatorEditRightXPosition,
        separatorLeftNavXPosition,
        separatorNavEditXPosition,
      })
    );
  };

  const onMove = (clientX: number) => {
    if (draggingLeftNav && leftWidth && navWidth && separatorLeftNavXPosition) {
      calculateLeftNavCombination(clientX);
    }
    if (draggingNavEdit && navWidth && editWidth && separatorNavEditXPosition) {
      calculateNavEditCombination(clientX);
    }
    if (draggingEditRight && editWidth && rightWidth && separatorEditRightXPosition) {
      calculateEditRightCombination(clientX);
    }
  };

  const calculateLeftNavCombination = (clientX: number) => {
    const combinedPixelWidth = Math.floor(leftWidth * viewWidth + navWidth * viewWidth);
    const newLeftWidth = Math.floor(leftWidth * viewWidth + clientX - separatorLeftNavXPosition);
    const newNavWidth = Math.floor(combinedPixelWidth - newLeftWidth);

    setSeparatorLeftNavXPosition(clientX);

    if (newLeftWidth < MIN_LEFT_PANE_WIDTH) {
      setLeftWidth(0);
      setNavWidth(combinedPixelWidth / viewWidth);
      setDraggingLeftNav(false);
      dispatch(toggleLeftMenu());
      return;
    }
    if (newNavWidth < MIN_WIDTH) {
      setNavWidth(MIN_WIDTH / viewWidth);
      setLeftWidth((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }

    setLeftWidth(newLeftWidth / viewWidth);
    setNavWidth(newNavWidth / viewWidth);
  };

  const calculateNavEditCombination = (clientX: number) => {
    const combinedPixelWidth = Math.floor(navWidth * viewWidth + editWidth * viewWidth);
    const newNavWidth = Math.floor(navWidth * viewWidth + clientX - separatorNavEditXPosition);
    const newEditWidth = Math.floor(combinedPixelWidth - newNavWidth);

    setSeparatorNavEditXPosition(clientX);
    if (newNavWidth < MIN_WIDTH) {
      setNavWidth(MIN_WIDTH / viewWidth);
      setEditWidth((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }
    if (newEditWidth < MIN_WIDTH) {
      setEditWidth(MIN_WIDTH / viewWidth);
      setNavWidth((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }

    setNavWidth(newNavWidth / viewWidth);
    setEditWidth(newEditWidth / viewWidth);
  };

  const calculateEditRightCombination = (clientX: number) => {
    const combinedPixelWidth = Math.floor(editWidth * viewWidth + rightWidth * viewWidth);
    const newEditWidth = Math.floor(editWidth * viewWidth + clientX - separatorEditRightXPosition);
    const newRightWidth = Math.floor(combinedPixelWidth - newEditWidth);

    setSeparatorEditRightXPosition(clientX);
    if (newEditWidth < MIN_WIDTH) {
      setEditWidth(MIN_WIDTH / viewWidth);
      setRightWidth((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }
    if (newRightWidth < MIN_WIDTH) {
      setRightWidth(MIN_WIDTH / viewWidth);
      setEditWidth((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }

    setEditWidth(newEditWidth / viewWidth);
    setRightWidth(newRightWidth / viewWidth);
  };

  useLayoutEffect(() => {
    // @ts-expect-error : dom event listener doesn't match React.*Event
    document.addEventListener('mousemove', onMouseMove);
    // @ts-expect-error
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      // @ts-expect-error
      document.removeEventListener('mousemove', onMouseMove);
      // @ts-expect-error
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  });

  return (
    <StyledSplitView>
      <Pane width={leftWidth * viewWidth} hide={hideLeft}>
        {left}
      </Pane>

      <StyledDividerHitBox
        // hide={hideLeft}
        onMouseDown={onMouseDownLeftNav}
        onTouchStart={onTouchStartLeftNav}
        onTouchEnd={onMouseUp}
      >
        <StyledDivider />
      </StyledDividerHitBox>

      <Pane width={navWidth * viewWidth} hide={false}>
        {nav}
      </Pane>

      <StyledDividerHitBox
        hide={false}
        onMouseDown={onMouseDownNavEdit}
        onTouchStart={onTouchStartNavEdit}
        onTouchEnd={onMouseUp}
      >
        <StyledDivider />
      </StyledDividerHitBox>

      <Pane width={editWidth * viewWidth} hide={false}>
        {editor}
      </Pane>

      <StyledDividerHitBox
        hide={hideRight}
        onMouseDown={onMouseDownEditRight}
        onTouchStart={onTouchStartEditRight}
        onTouchEnd={onMouseUp}
      >
        <StyledDivider />
      </StyledDividerHitBox>

      <Pane width={rightWidth * viewWidth} hide={hideRight}>
        {right}
      </Pane>
    </StyledSplitView>
  );
};

export default SplitView;
