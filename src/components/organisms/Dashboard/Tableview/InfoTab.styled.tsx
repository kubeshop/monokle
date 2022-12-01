import styled from 'styled-components';

import Colors from '@styles/Colors';

export const Container = styled.div`
  padding: 24px;
  height: 100%;
  overflow-y: scroll;
`;

export const Row = styled.div`
  margin-bottom: 24px;
`;

export const Title = styled.div`
  color: ${Colors.grey9};
  font-weight: 400;
  font-size: 13px;
  margin-bottom: 2px;
`;

export const BlueContent = styled.div`
  color: ${Colors.blue7};
`;

export const GreyContent = styled.div`
  color: ${Colors.grey7};
`;
