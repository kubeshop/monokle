import {Spin} from 'antd';

import styled from 'styled-components';

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: inherit;
`;

interface SpinnerProps {
  isSpinning?: boolean;
  size?: 'small' | 'default' | 'large';
}

const Spinner: React.FC<SpinnerProps> = props => {
  const {isSpinning = true, size = 'small'} = props;

  return (
    <SpinnerWrapper>
      <Spin spinning={isSpinning} size={size} />
    </SpinnerWrapper>
  );
};

export default Spinner;
