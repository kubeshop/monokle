import * as S from './CompareFigure.styled';

type Props = {
  src: string;
  children?: React.ReactNode;
};

const CompareFigure: React.FC<Props> = ({src, children}) => {
  return (
    <S.FigureDiv>
      <img src={src} />
      <S.ContentDiv>{children}</S.ContentDiv>
    </S.FigureDiv>
  );
};

export default CompareFigure;
