import {CollapsePanelProps} from 'antd';

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

  const height = usePaneHeight() - PANEL_HEADER_HEIGHT - 130 - (props.panelKey === 'files' ? 30 : 0);

  return <S.Panel collapsible={props.disabled ? 'disabled' : undefined} id={id} $contentHeight={height} {...props} />;
};

export default AccordionPanel;
