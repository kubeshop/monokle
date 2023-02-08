import {useState} from 'react';
import {useEffectOnce} from 'react-use';

import {CollapsePanelProps} from 'antd';

import {useResizeObserverRef} from 'rooks';

import * as S from './AccordionPanel.styled';

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

  return <S.Panel id={id} contentHeight={contentHeight} {...props} />;
}
