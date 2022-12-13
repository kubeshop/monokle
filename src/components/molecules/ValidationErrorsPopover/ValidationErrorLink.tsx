import {ResourceValidationError} from '@models/k8sresource';

import * as S from './ValidationErrorLink.styled';

interface IProps {
  validationError: ResourceValidationError;
  onClick: (args?: any) => void;
}

const ValidationErrorLink: React.FC<IProps> = props => {
  const {validationError, onClick} = props;

  return (
    <div onClick={onClick}>
      <S.RefText>{validationError.property}</S.RefText>
      {validationError.errorPos && (
        <S.PositionText>
          {validationError.errorPos.line}:{validationError.errorPos.column}
        </S.PositionText>
      )}
      <S.ErrorMessage>{validationError.message}</S.ErrorMessage>
    </div>
  );
};

export default ValidationErrorLink;
