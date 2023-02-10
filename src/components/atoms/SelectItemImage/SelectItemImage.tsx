import SelectItemFromLeft from '@assets/SelectItemFromLeft.svg';

import * as S from './SelectItemImage.styled';

type IProps = {
  text: string;
  style?: React.CSSProperties;
};

const SelectItemImage: React.FC<IProps> = props => {
  const {style = {}, text} = props;

  return (
    <S.Container style={style}>
      <S.Image src={SelectItemFromLeft} />
      <S.Text>{text}</S.Text>
    </S.Container>
  );
};

export default SelectItemImage;
