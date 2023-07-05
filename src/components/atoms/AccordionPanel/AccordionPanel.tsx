import {Collapse, CollapsePanelProps} from 'antd';

import styled from 'styled-components';

import {usePaneHeight} from '@hooks/usePaneHeight';

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

  const height = usePaneHeight() - PANEL_HEADER_HEIGHT - 130 - (props.panelKey === 'files' ? 35 : 25);

  return (
    <Panel
      {...props}
      collapsible={props.disabled ? 'disabled' : undefined}
      id={id}
      $contentHeight={id !== 'accordion-panel-files' ? height + 12 : height}
    />
  );
};

export default AccordionPanel;

// Styled Components

const Panel = styled(Collapse.Panel)<{$contentHeight: number}>`
  &.ant-collapse-item-active {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-bottom: 2px;
  }

  .ant-collapse-content-box {
    padding: 0;
    overflow-y: hidden;
    max-height: ${props => props.$contentHeight}px;
    height: ${props => props.$contentHeight}px;
  }
`;
