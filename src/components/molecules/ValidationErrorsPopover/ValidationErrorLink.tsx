// import {ResourceValidationError} from '@shared/models/k8sResource';
// import * as S from './ValidationErrorLink.styled';

// interface IProps {
//   validationError: ResourceValidationError;
//   onClick: (args?: any) => void;
// }

// TODO: this component has to be reimplemented after the @monokle/validation library is integrated
const ValidationErrorLink = () => {
  return <div />;
  // const {validationError, onClick} = props;

  // return (
  //   <div onClick={onClick}>
  //     <S.RefText>{validationError.property}</S.RefText>
  //     {validationError.errorPos && (
  //       <S.PositionText>
  //         {validationError.errorPos.line}:{validationError.errorPos.column}
  //       </S.PositionText>
  //     )}
  //     <S.ErrorMessage>{validationError.message}</S.ErrorMessage>
  //   </div>
  // );
};

export default ValidationErrorLink;
