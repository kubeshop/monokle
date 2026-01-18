import ValidationSettings from '@assets/ValidationSettings.svg';

import * as S from './SelectItemImage.styled';

type IProps = {
  text: string;
  imageStyle?: React.CSSProperties;
  style?: React.CSSProperties;
};

const SelectItemImage: React.FC<IProps> = props => {
  const {imageStyle = {}, style = {}, text} = props;

  return (
    <S.Container style={style}>
      <S.Image style={imageStyle} src={ValidationSettings} />
      <S.Text>{text}</S.Text>
    </S.Container>
  );
};

export default SelectItemImage;
