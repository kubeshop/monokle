import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {TitleBarWrapper} from '@components/atoms';

import {Colors, Icon, TitleBar} from '@monokle/components';

function DryRunsPane() {
  const dispatch = useAppDispatch();
  const preview = useAppSelector(state => state.main.preview);

  return (
    <Container>
      <TitleBarWrapper>
        <TitleBar type="secondary" headerStyle={{background: '#232A2D'}} isOpen title="Dry runs" />
      </TitleBarWrapper>

      <StyledUl>
        <Subheading>
          <Icon name="helm" />
          <span>helm chart</span>
        </Subheading>
      </StyledUl>

      <StyledUl>
        <Subheading>
          <Icon name="kustomize" />
          <span>kustomize</span>
        </Subheading>
      </StyledUl>
    </Container>
  );
}

export default DryRunsPane;

export const PanelContainer = styled.div`
  height: 100%;
  max-height: inherit;
  background-color: ${Colors.grey10};
  overflow: hidden;
  z-index: -2;
  padding-bottom: 12px;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
`;

const Container = styled(PanelContainer)`
  display: flex;
  flex-flow: column;
  overflow-y: auto;
`;

const StyledUl = styled.ul`
  flex: auto 0;
  padding: 0 8px;
  margin: 0;
  margin-bottom: 16px;
`;

const Subheading = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
`;
