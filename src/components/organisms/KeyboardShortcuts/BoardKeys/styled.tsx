import styled from 'styled-components';

import Colors from '@styles/Colors';

export const StyledShortCut = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledShortCell = styled.div`
  display: flex;

  :not(:first-child) {
    margin-top: 10px;
  }
`;

export const StyledKey = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  background: ${Colors.cyan7};
  color: ${Colors.blackPearl};
  margin-left: 5px;
  border: 1px solid #33bcb7;
  box-sizing: border-box;
  box-shadow: 0px 2px 0px rgba(0, 0, 0, 0.016);
  border-radius: 2px;
`;
