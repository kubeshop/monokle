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
import {setPaneConfiguration, setRightMenuIsActive, setLeftMenuIsActive} from '@redux/reducers/ui';

const MIN_WIDTH = 300;
const MIN_LEFT_PANE_WIDTH = 300;
const MIN_RIGHT_PANE_WIDTH = 200;
const SEPARATOR_WIDTH = 5; // width including hitbox

const getSplitViewCursor = (props: StyledSplitViewProps) => {
  if (props.draggingLeftNav && props.hideLeft) {
    return 'e-resize !important';
  }
  if (props.draggingEditRight && props.hideRight) {
    return 'w-resize !important';
  }

  if (props.draggingLeftNav || props.draggingNavEdit || props.draggingEditRight) {
    return 'col-resize !important';
  }
  return '';
};

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

export type StyledSplitViewProps = {
  hideLeft: boolean;
  hideRight: boolean;
  draggingLeftNav: boolean;
  draggingNavEdit: boolean;
  draggingEditRight: boolean;
};

const StyledSplitView = styled.div.attrs((props: StyledSplitViewProps) => props)`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  cursor: ${getSplitViewCursor};
`;

export type DividerProps = {
  hide: boolean;
  paintBackground: boolean;
};
const StyledDivider = styled.div`
  width: 0px;
  height: 100%;
  margin: 1px;
  border-left: ${AppBorders.pageDivider};
`;

const StyledDividerHitBox = styled.div.attrs((props: DividerProps) => props)`
  align-self: stretch;
  display: ${props => (props.hide ? 'none' : 'flex')};
  align-items: center;
  padding: 0 1px;
  cursor: col-resize;
  background-color: ${props => (props.paintBackground ? 'rgba(23, 125, 220, 0.5)' : 'rgba(23, 125, 220, 0)')};
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

  const numSeparatorsActive = 2 + (hideLeft ? 0 : 1);
  const splitPaneWidth = viewWidth - numSeparatorsActive * SEPARATOR_WIDTH;

  // pane widths
  const paneConfiguration = useAppSelector(state => state.ui.paneConfiguration);
  const [leftWidth, setLeftWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.leftWidth));
  const [navWidth, setNavWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.navWidth));
  const [editWidth, setEditWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.editWidth));
  const [rightWidth, setRightWidth] = useState<number>(useAppSelector(state => state.ui.paneConfiguration.rightWidth));

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

  const [mouseXPosition, setMouseXPosition] = useState(0);
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

    const widthMultiplier = 1 / totalWidth;

    return {
      left: splitPaneWidth * paneWidths.left * widthMultiplier,
      nav: splitPaneWidth * paneWidths.nav * widthMultiplier,
      edit: splitPaneWidth * paneWidths.edit * widthMultiplier,
      right: splitPaneWidth * paneWidths.right * widthMultiplier,
    };
  };

  const drawLayout = (sizes: any) => {
    /*
      Possible configurations (left, right) -> left: 25%, nav: 25%, edit:25%, right:25%
      cc: closed, closed -> left: 0%, nav: 50%, edit:50%, right:0% (default)
      oc: open, closed -> left: 33%, nav: 33%, edit:33%, right:0%
      co: closed, open -> left: 0%, nav: 33%, edit:33%, right:33%
      oo: open, open -> left: 25%, nav: 25%, edit:25%, right:25%
    */
    const cfg = hideLeft && hideRight ? 'cc' : !hideLeft && hideRight ? 'oc' : hideLeft && !hideRight ? 'co' : 'oo';

    sizes = normalizePaneWidths(sizes, cfg);

    setLeftWidth(sizes.left / viewWidth);
    setNavWidth(sizes.nav / viewWidth);
    setEditWidth(sizes.edit / viewWidth);
    setRightWidth(sizes.right / viewWidth);
  };

  const calculateLeftWidthOnDrawersChange = () => {
    if (hideLeft) {
      return 0;
    }

    if (leftWidth > MIN_LEFT_PANE_WIDTH / viewWidth) {
      return leftWidth;
    }

    return MIN_LEFT_PANE_WIDTH / viewWidth;
  };

  const calculateRightWidthOnDrawersChange = () => {
    if (hideRight) {
      return 0;
    }

    if (rightWidth > MIN_RIGHT_PANE_WIDTH / viewWidth) {
      return rightWidth;
    }

    return MIN_RIGHT_PANE_WIDTH / viewWidth;
  };

  useEffect(() => {
    drawLayout({
      left: paneConfiguration.leftWidth,
      nav: paneConfiguration.navWidth,
      edit: paneConfiguration.editWidth,
      right: paneConfiguration.rightWidth,
    });
  }, [paneConfiguration]);

  useEffect(() => {
    dispatch(
      setPaneConfiguration({
        ...paneConfiguration,
        leftWidth: calculateLeftWidthOnDrawersChange(),
        rightWidth: calculateRightWidthOnDrawersChange(),
      })
    );
  }, [hideLeft, hideRight]);

  const onMouseDownLeftNav = (evt: MouseEvent<HTMLElement>): any => {
    setSeparatorLeftNavXPosition(evt.clientX);
    setDraggingLeftNav(true);
  };

  const onTouchStartLeftNav = (evt: TouchEvent<HTMLElement>): any => {
    setSeparatorLeftNavXPosition(evt.touches[0].clientX);
    setDraggingLeftNav(true);
  };

  const onMouseDownNavEdit = (evt: MouseEvent<HTMLElement>): any => {
    setSeparatorNavEditXPosition(evt.clientX);
    setDraggingNavEdit(true);
  };

  const onTouchStartNavEdit = (evt: TouchEvent<HTMLElement>): any => {
    setSeparatorNavEditXPosition(evt.touches[0].clientX);
    setDraggingNavEdit(true);
  };

  const onMouseDownEditRight = (evt: MouseEvent<HTMLElement>): any => {
    setSeparatorEditRightXPosition(evt.clientX);
    setDraggingEditRight(true);
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

    if (
      paneConfiguration.leftWidth !== leftWidth ||
      paneConfiguration.navWidth !== navWidth ||
      paneConfiguration.editWidth !== editWidth ||
      paneConfiguration.rightWidth !== rightWidth
    ) {
      dispatch(
        setPaneConfiguration({
          leftWidth,
          navWidth,
          editWidth,
          rightWidth,
        })
      );
    }
  };

  const onMove = (clientX: number) => {
    let movingDirection: string = 'NOTR';

    if (clientX < 45 || clientX > viewWidth) {
      return;
    }
    if (clientX < mouseXPosition) {
      movingDirection = 'LEFT';
    } else if (clientX > mouseXPosition) {
      movingDirection = 'RIGHT';
    }

    if (draggingLeftNav) {
      calculateLeftNavCombination(clientX, movingDirection);
    }
    if (draggingNavEdit) {
      calculateNavEditCombination(clientX);
    }
    if (draggingEditRight) {
      calculateEditRightCombination(clientX, movingDirection);
    }

    setMouseXPosition(clientX);
  };

  const calculateLeftNavCombination = (clientX: number, movingDirection: string) => {
    const combinedPixelWidth = Math.floor((hideLeft ? 0 : leftWidth) * viewWidth + navWidth * viewWidth);
    const newLeftWidth = Math.floor(leftWidth * viewWidth + clientX - separatorLeftNavXPosition);
    const newNavWidth = Math.floor(combinedPixelWidth - (hideLeft ? 0 : newLeftWidth));

    setSeparatorLeftNavXPosition(clientX);

    if (movingDirection === 'LEFT' && !hideLeft && newLeftWidth < MIN_LEFT_PANE_WIDTH) {
      setDraggingLeftNav(false);
      drawLayout({
        left: 0,
        nav: combinedPixelWidth / viewWidth,
        edit: editWidth,
        right: rightWidth,
      });
      dispatch(setLeftMenuIsActive(false));
      return;
    }

    if (movingDirection === 'RIGHT' && hideLeft && newLeftWidth > MIN_LEFT_PANE_WIDTH) {
      drawLayout({
        left: MIN_LEFT_PANE_WIDTH / viewWidth,
        nav: (combinedPixelWidth - MIN_LEFT_PANE_WIDTH) / viewWidth,
        edit: editWidth,
        right: rightWidth,
      });
      dispatch(setLeftMenuIsActive(true));
      return;
    }

    if (newNavWidth < MIN_WIDTH) {
      drawLayout({
        left: (combinedPixelWidth - MIN_WIDTH) / viewWidth,
        nav: MIN_WIDTH / viewWidth,
        edit: editWidth,
        right: rightWidth,
      });
      return;
    }

    drawLayout({
      left: newLeftWidth / viewWidth,
      nav: newNavWidth / viewWidth,
      edit: editWidth,
      right: rightWidth,
    });
  };

  const calculateNavEditCombination = (clientX: number) => {
    const combinedPixelWidth = Math.floor(navWidth * viewWidth + editWidth * viewWidth);
    const newNavWidth = Math.floor(navWidth * viewWidth + clientX - separatorNavEditXPosition);
    const newEditWidth = Math.floor(combinedPixelWidth - newNavWidth);

    setSeparatorNavEditXPosition(clientX);
    if (newNavWidth < MIN_WIDTH) {
      drawLayout({
        left: leftWidth,
        nav: MIN_WIDTH / viewWidth,
        edit: (combinedPixelWidth - MIN_WIDTH) / viewWidth,
        right: rightWidth,
      });
      return;
    }
    if (newEditWidth < MIN_WIDTH) {
      drawLayout({
        left: leftWidth,
        nav: (combinedPixelWidth - MIN_WIDTH) / viewWidth,
        edit: MIN_WIDTH / viewWidth,
        right: rightWidth,
      });
      return;
    }

    drawLayout({
      left: leftWidth,
      nav: newNavWidth / viewWidth,
      edit: newEditWidth / viewWidth,
      right: rightWidth,
    });
  };

  const calculateEditRightCombination = (clientX: number, movingDirection: string) => {
    const combinedPixelWidth = Math.floor(editWidth * viewWidth + (hideRight ? 0 : rightWidth) * viewWidth);
    const newEditWidth = Math.floor(editWidth * viewWidth + clientX - separatorEditRightXPosition);
    const newRightWidth = hideRight ? 0 : Math.floor(combinedPixelWidth - newEditWidth);

    setSeparatorEditRightXPosition(clientX);

    if (movingDirection === 'RIGHT' && !hideRight && newRightWidth < MIN_RIGHT_PANE_WIDTH) {
      setDraggingEditRight(false);
      drawLayout({
        left: leftWidth,
        nav: navWidth,
        edit: combinedPixelWidth / viewWidth,
        right: 0,
      });
      dispatch(setRightMenuIsActive(false));
      return;
    }

    if (movingDirection === 'LEFT' && hideRight && newRightWidth > MIN_RIGHT_PANE_WIDTH) {
      drawLayout({
        left: leftWidth,
        nav: navWidth,
        edit: (combinedPixelWidth - MIN_RIGHT_PANE_WIDTH) / viewWidth,
        right: MIN_RIGHT_PANE_WIDTH / viewWidth,
      });
      dispatch(setRightMenuIsActive(true));
      return;
    }

    if (newEditWidth < MIN_WIDTH) {
      drawLayout({
        left: leftWidth,
        nav: navWidth,
        edit: MIN_WIDTH / viewWidth,
        right: (combinedPixelWidth - MIN_WIDTH) / viewWidth,
      });
      return;
    }

    drawLayout({
      left: leftWidth,
      nav: navWidth,
      edit: newEditWidth / viewWidth,
      right: newRightWidth / viewWidth,
    });
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
    <StyledSplitView
      draggingLeftNav={draggingLeftNav}
      draggingNavEdit={draggingNavEdit}
      draggingEditRight={draggingEditRight}
      hideLeft={hideLeft}
      hideRight={hideRight}
    >
      <Pane width={leftWidth * viewWidth} hide={hideLeft}>
        {left}
      </Pane>

      <StyledDividerHitBox
        onMouseDown={onMouseDownLeftNav}
        onTouchStart={onTouchStartLeftNav}
        onTouchEnd={onMouseUp}
        paintBackground={draggingLeftNav}
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
        paintBackground={draggingNavEdit}
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
        paintBackground={draggingEditRight}
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
