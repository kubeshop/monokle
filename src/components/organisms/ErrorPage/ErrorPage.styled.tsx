import styled from 'styled-components';

import Colors from '@styles/Colors';

export const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
`;

export const Figure = styled.img`
  width: 16rem;
  height: 16rem;
`;

export const Heading = styled.h1`
  color: ${Colors.red7};
  font-weight: 600;
  font-size: 32px;
  line-height: 39px;
`;

export const Description = styled.p`
  margin-bottom: 0px;
`;
