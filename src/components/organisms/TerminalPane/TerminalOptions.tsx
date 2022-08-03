import * as S from './TerminalOptions.styled';

const TerminalOptions: React.FC = () => {
  return (
    <S.TerminalOptionsContainer>
      <S.OptionLabel>Font size</S.OptionLabel>
      <S.Input placeholder="" />
    </S.TerminalOptionsContainer>
  );
};

export default TerminalOptions;
