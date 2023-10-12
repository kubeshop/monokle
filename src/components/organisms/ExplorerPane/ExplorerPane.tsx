import {Allotment} from 'allotment';
import styled from 'styled-components';

import {PANEL_HEADER_HEIGHT} from '@components/atoms/AccordionPanel/AccordionPanel';

import {Colors, PanelColors} from '@monokle/components';

import DryRunsPane from './DryRunsPane';
import FilePane from './FilePane';

const ExplorerPane: React.FC = () => {
  return (
    <StyledAllotment vertical>
      <Allotment.Pane minSize={PANEL_HEADER_HEIGHT + 16}>
        <PaneContainer>
          <FilePane key="files" />
        </PaneContainer>
      </Allotment.Pane>
      <Allotment.Pane minSize={54}>
        <PaneContainer>
          <DryRunsPane key="dry-runs" />
        </PaneContainer>
      </Allotment.Pane>
    </StyledAllotment>
  );
};

export default ExplorerPane;

const PaneContainer = styled.div`
  background: ${PanelColors.toolBar};
  height: 100%;
`;

const StyledAllotment = styled(Allotment)`
  --sash-hover-size: 3px;
  --separator-border: ${Colors.backgroundGrey};
  --focus-border: ${Colors.geekblue7};
`;
