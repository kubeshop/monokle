import {ReactNode} from 'react';

import * as S from './CompareFigure.styled';

export function DiffFigure({src, children}: {src: string; children?: ReactNode}) {
  return (
    <S.FigureDiv>
      <img src={src} />
      <S.ContentDiv>{children}</S.ContentDiv>
    </S.FigureDiv>
  );
}
