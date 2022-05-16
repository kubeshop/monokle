import {Button} from 'antd';

import styled from 'styled-components';

export function DiffModalFooter({onClose}: {onClose: () => void}) {
  return (
    <FooterDiv>
      <div />

      <Button type="link" onClick={onClose}>
        Close
      </Button>
    </FooterDiv>
  );
}

const FooterDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
