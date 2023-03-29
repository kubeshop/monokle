import {useState} from 'react';
import {useEffectOnce} from 'react-use';

import {CollapsePanelProps} from 'antd';

import {useResizeObserverRef} from 'rooks';

import {usePaneHeight} from '@hooks/usePaneHeight';

import * as S from './AccordionPanel.styled';

export const PANEL_HEADER_HEIGHT = 72;

export const getPanelId = (panelKey?: string) => `accordion-panel-${panelKey}`;

// Props injected by Collapse when it clones the Panel
export type InjectedPanelProps = {
  disabled?: boolean;
  isActive?: boolean;
  panelKey?: string;
};

const AccordionPanel: React.FC<CollapsePanelProps & InjectedPanelProps> = props => {
  const id = getPanelId(props.panelKey);
  const [contentHeight, setContentHeight] = useState<number>(1);

  const height = usePaneHeight() - PANEL_HEADER_HEIGHT - 165;

  const [containerRef] = useResizeObserverRef(el => {
    if (!el) return;
    const [{contentRect}] = el;
    setContentHeight(contentRect ? contentRect.height - PANEL_HEADER_HEIGHT : 1);
  });

  useEffectOnce(() => {
    containerRef(document.querySelector(`#${id}`));
  });

  return (
    <S.Panel
      collapsible={props.disabled ? 'disabled' : undefined}
      id={id}
      $contentHeight={contentHeight < height ? contentHeight : height}
      {...props}
    />
  );
};

export default AccordionPanel;
