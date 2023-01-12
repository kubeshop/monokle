import * as S from './LearnCard.styled';

type IProps = {
  buttonText: string;
  description: string;
  icon: JSX.Element;
  title: string;
  onClick: () => void;
};

const LearnCard: React.FC<IProps> = props => {
  const {buttonText, description, icon, title, onClick} = props;

  return (
    <S.LearnCardContainer>
      <S.Icon>{icon}</S.Icon>
      <S.Title>{title}</S.Title>
      <S.Description>{description}</S.Description>
      <S.Button type="primary" onClick={onClick}>
        {buttonText}
      </S.Button>
    </S.LearnCardContainer>
  );
};

export default LearnCard;
