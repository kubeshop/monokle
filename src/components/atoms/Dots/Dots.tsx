import {useMemo} from 'react';

import Colors from '@styles/Colors';

import * as S from './Dots.styled';

interface DotsProps {
  color?: Colors;
  dotNumber?: number;
}

const Dots: React.FC<DotsProps> = props => {
  const {color = Colors.blue6, dotNumber = 3} = props;

  const dots = useMemo(
    () =>
      Array.from({length: dotNumber}).map((_, index) => {
        const key = `dot_${index}`;

        return <S.Dot key={key} $color={color} />;
      }),
    [color, dotNumber]
  );

  return <S.DotsContainer>{dots}</S.DotsContainer>;
};

export default Dots;
