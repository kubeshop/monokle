import {ReactNode} from 'react';

import styled from 'styled-components';

import Colors from '@styles/Colors';

const FigureDiv = styled.div`
  display: 'flex';
  flex-direction: 'column';
  width: '100%';
  height: '100%';
  align-items: 'center';
  justify-content: 'center';
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

export function DiffFigure({src, children}: {src: string; children?: ReactNode}) {
  return (
    <FigureDiv
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={src} />
      <div style={{width: 350, paddingTop: 24, textAlign: 'center'}}>{children}</div>
    </FigureDiv>
  );
}
