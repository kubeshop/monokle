import styled from 'styled-components';

import Colors from '@styles/Colors';

export const FigureDiv = styled.div`
  display: 'flex';
  flex-direction: 'column';
  width: '100%';
  height: '100%';
  align-items: 'center';
  justify-content: 'center';
`;

export const ContentDiv = styled.div`
  width: 350px;
  padding-top: 24px;
  text-align: center;
`;

export const FigureTitle = styled.h1`
  color: ${props => props.color ?? Colors.whitePure};
  font-size: medium;
  font-weight: bold;
`;

export const FigureDescription = styled.p`
  color: ${props => props.color ?? Colors.whitePure};
  font-size: small;
  font-weight: normal;
`;
