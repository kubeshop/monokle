import * as S from './HelpfulResourceCard.styled';

type IProps = {
  description: string;
  title: string;
  onClick: () => void;
};

const HelpfulResourceCard: React.FC<IProps> = props => {
  const {description, title, onClick} = props;

  return (
    <S.HelpfulResourceCardContainer>
      <S.Title onClick={onClick}>{title}</S.Title>
      <S.Description>{description}</S.Description>
    </S.HelpfulResourceCardContainer>
  );
};

export default HelpfulResourceCard;
