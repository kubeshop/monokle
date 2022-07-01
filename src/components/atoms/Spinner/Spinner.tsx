import {Spin} from 'antd';

import * as S from './Spinner.styled';

interface SpinnerProps {
  isSpinning?: boolean;
  size?: 'small' | 'default' | 'large';
}

const Spinner: React.FC<SpinnerProps> = props => {
  const {isSpinning = true, size = 'small'} = props;

  return (
    <S.SpinnerWrapper>
      <Spin spinning={isSpinning} size={size} />
    </S.SpinnerWrapper>
  );
};

export default Spinner;
