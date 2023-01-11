import * as S from './HelpfulResourceCard.styled';

type IProps = {
  description: string;
  title: string;
};

const HelpfulResourceCard: React.FC<IProps> = props => {
  const {description, title} = props;

  return (
    <S.HelpfulResourceCardContainer>
      <S.Title>{title}</S.Title>
      <S.Description>{description}</S.Description>
    </S.HelpfulResourceCardContainer>
  );
};

export default HelpfulResourceCard;
