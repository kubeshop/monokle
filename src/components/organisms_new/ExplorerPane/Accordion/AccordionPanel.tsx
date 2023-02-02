import {useState} from 'react';
import {useEffectOnce} from 'react-use';

import {Collapse, CollapsePanelProps} from 'antd';

import {useResizeObserverRef} from 'rooks';
import styled from 'styled-components';

export const PANEL_HEADER_HEIGHT = 72;

export const getPanelId = (panelKey?: string) => `accordion-panel-${panelKey}`;

// Props injected by Collapse when it clones the Panel
export type InjectedPanelProps = {
  isActive?: boolean;
  panelKey?: string;
};

export function AccordionPanel(props: CollapsePanelProps & InjectedPanelProps) {
  const id = getPanelId(props.panelKey);
  const [contentHeight, setContentHeight] = useState<number>(1);

  const [containerRef] = useResizeObserverRef(el => {
    if (!el) return;
    const [{contentRect}] = el;
    setContentHeight(contentRect ? contentRect.height - PANEL_HEADER_HEIGHT : 1);
  });

  useEffectOnce(() => {
    containerRef(document.querySelector(`#${id}`));
  });

  return <StyledPanel id={id} contentHeight={contentHeight} {...props} />;
}

export const StyledPanel = styled(Collapse.Panel)`
  &.ant-collapse-item-active {
    height: 100%;
  }

  .ant-collapse-content-box {
    padding: 0 !important;
    overflow-y: hidden;
    max-height: ${(props: {contentHeight: number}) => props.contentHeight}px;
  }
`;
