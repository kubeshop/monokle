import React, {useState, useLayoutEffect, MouseEvent, TouchEvent, ReactElement, FunctionComponent} from 'react';
import styled from 'styled-components';

const MIN_WIDTH = 25;
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
  border-left: 1px solid #808080;
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
  const [leftHidden, setLeftHidden] = useState<boolean>(hideLeft);
  const [rightHidden, setRightHidden] = useState<boolean>(hideRight);

  const numSeparatorsActive = 1 + (leftHidden ? 0 : 1) + (rightHidden ? 0 : 1);
  const splitPaneWidth = viewWidth - numSeparatorsActive * SEPARATOR_WIDTH;

  // pane widths
  const [leftWidth, setLeftWidth] = useState<number>(0);
  const [navWidth, setNavWidth] = useState<number>(0.5);
  const [editWidth, setEditWidth] = useState<number>(0.5);
  const [rightWidth, setRightWidth] = useState<number>(0);

  // detect pane changes
  if (leftHidden !== hideLeft || rightHidden !== hideRight) {
    setLeftHidden(hideLeft);
    setRightHidden(hideRight);

    /*
      Possible configurations (left, right) -> left: 25%, nav: 25%, edit:25%, right:25%
      cc: closed, closed -> left: 0%, nav: 50%, edit:50%, right:0% (default)
      oc: open, closed -> left: 33%, nav: 33%, edit:33%, right:0%
      co: closed, open -> left: 0%, nav: 33%, edit:33%, right:33%
      oo: open, open -> left: 25%, nav: 25%, edit:25%, right:25%
    */
    const cfg = hideLeft && hideRight ? 'cc' : !hideLeft && hideRight ? 'oc' : hideLeft && !hideRight ? 'co' : 'oo';

    const sizeLeft = cfg === 'oc' ? splitPaneWidth * 0.33333 : cfg === 'oo' ? splitPaneWidth * 0.25 : 0;
    const sizeRight = cfg === 'co' ? splitPaneWidth * 0.33333 : cfg === 'oo' ? splitPaneWidth * 0.25 : 0;
    const sizeNavEdit =
      cfg === 'oc' || cfg === 'co'
        ? splitPaneWidth * 0.33333
        : cfg === 'oo'
        ? splitPaneWidth * 0.25
        : splitPaneWidth * 0.5;
    setLeftWidth(sizeLeft / viewWidth);
    setNavWidth(sizeNavEdit / viewWidth);
    setEditWidth(sizeNavEdit / viewWidth);
    setRightWidth(sizeRight / viewWidth);
  }

  // separator positions and drag status
  const [separatorLeftNavXPosition, setSeparatorLeftNavXPosition] = useState<number>(splitPaneWidth * 0.25);
  const [separatorNavEditXPosition, setSeparatorNavEditXPosition] = useState<number>(splitPaneWidth * 0.5);
  const [separatorEditRightXPosition, setSeparatorEditRightXPosition] = useState<number>(splitPaneWidth * 0.75);
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
  };

  const onMove = (clientX: number) => {
    if (draggingLeftNav && leftWidth && navWidth && separatorLeftNavXPosition) {
      calcPaneWidth(
        leftWidth,
        navWidth,
        clientX,
        separatorLeftNavXPosition,
        setSeparatorLeftNavXPosition,
        setLeftWidth,
        setNavWidth
      );
    }
    if (draggingNavEdit && navWidth && editWidth && separatorNavEditXPosition) {
      calcPaneWidth(
        navWidth,
        editWidth,
        clientX,
        separatorNavEditXPosition,
        setSeparatorNavEditXPosition,
        setNavWidth,
        setEditWidth
      );
    }
    if (draggingEditRight && editWidth && rightWidth && separatorEditRightXPosition) {
      calcPaneWidth(
        editWidth,
        rightWidth,
        clientX,
        separatorEditRightXPosition,
        setSeparatorEditRightXPosition,
        setEditWidth,
        setRightWidth
      );
    }
  };

  const calcPaneWidth = (
    paneWidthA: number,
    paneWidthB: number,
    clientX: number,
    separatorX: number,
    setSepX: Function,
    setWidthA: Function,
    setWidthB: Function
  ): void => {
    const combinedPixelWidth = Math.floor(paneWidthA * viewWidth + paneWidthB * viewWidth);
    const newPixelWidthA = Math.floor(paneWidthA * viewWidth + clientX - separatorX);
    const newPixelWidthB = Math.floor(combinedPixelWidth - newPixelWidthA);

    setSepX(clientX);

    // if trying to resize under minimum size
    if (newPixelWidthA < MIN_WIDTH) {
      setWidthA(MIN_WIDTH / viewWidth);
      setWidthB((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }
    if (newPixelWidthB < MIN_WIDTH) {
      setWidthB(MIN_WIDTH / viewWidth);
      setWidthA((combinedPixelWidth - MIN_WIDTH) / viewWidth);
      return;
    }

    setWidthA(newPixelWidthA / viewWidth);
    setWidthB(newPixelWidthB / viewWidth);
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
      <Pane width={leftWidth * viewWidth} hide={leftHidden}>
        {left}
      </Pane>

      <StyledDividerHitBox
        hide={leftHidden}
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
        hide={rightHidden}
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
