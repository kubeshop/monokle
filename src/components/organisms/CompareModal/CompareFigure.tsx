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

const FigureTitle = styled.h1`
  font-size: medium;
  font-weight: bold;
`;

const FigureDescription = styled.p`
  font-size: small;
  font-weight: normal;
`;

export function DiffFigure({
  src,
  title,
  description,
  color = Colors.whitePure,
}: {
  src: string;
  title?: string;
  description?: string;
  color?: Colors;
}) {
  return (
    <FigureDiv
      style={{
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={src} />

      <div style={{width: 350, paddingTop: 24, textAlign: 'center'}}>
        {title ? <FigureTitle style={{color}}>{title}</FigureTitle> : null}
        {description ? <FigureDescription style={{color}}>{description} </FigureDescription> : null}
      </div>
    </FigureDiv>
  );
}
