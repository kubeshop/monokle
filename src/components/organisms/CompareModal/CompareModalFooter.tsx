import {Button} from 'antd';

import styled from 'styled-components';

type Props = {
  onClose: () => void;
};

const FooterDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CompareModalFooter: React.FC<Props> = ({onClose}) => {
  return (
    <FooterDiv>
      <div />

      <Button type="link" onClick={onClose}>
        Close
      </Button>
    </FooterDiv>
  );
};
