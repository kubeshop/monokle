import {Icon} from '@components/atoms';

import * as S from './OPAValidationStatus.styled';

const OPAValidationStatus: React.FC = () => {
  return (
    <S.Container $status="active">
      <Icon name="opa-status" />
      {5}
    </S.Container>
  );
};

export default OPAValidationStatus;
