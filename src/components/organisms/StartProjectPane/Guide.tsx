import * as S from './Guide.styled';

const Guide = () => {
  return (
    <S.Container>
      <S.ExclamationCircleFilled />
      <S.Item>Read a quick start guide</S.Item>
      <S.Item>Watch a 3-minute video tutorial</S.Item>
      <S.Item>Documentation</S.Item>
    </S.Container>
  );
};

export default Guide;
