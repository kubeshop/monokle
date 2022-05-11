import {Button} from 'antd';

import styled from 'styled-components';

const StyledButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export function DiffModalFooter({onClose}: {onClose: () => void}) {
  return (
    <StyledButtonsContainer>
      <div />

      <Button type="link" onClick={onClose}>
        Close
      </Button>
    </StyledButtonsContainer>
  );
}
