import {useAppDispatch} from '@redux/hooks';
import {handleWalkThroughStep} from '@redux/reducers/ui';

import {wkContent} from './wkContent';

import * as S from './styled';

type WalkThroughProps = {
  walkThrough: {
    content: string;
    currentStep: number;
  };
};

const WalkThrough = (props: WalkThroughProps) => {
  const {
    walkThrough: {content, currentStep},
  } = props;
  const dispatch = useAppDispatch();

  const handleStep = (step: number) => {
    dispatch(handleWalkThroughStep(step));
  };

  return (
    <>
      <S.Description>{content}</S.Description>
      <S.FlexContainer>
        <div>
          {currentStep} of {wkContent.totalStepCount}
        </div>
        <div>
          {currentStep !== 1 && <S.StyledButton onClick={() => handleStep(-1)}>Previous</S.StyledButton>}
          <S.StyledButton type="primary" onClick={() => handleStep(1)}>
            {wkContent.totalStepCount === currentStep ? 'Got it!' : 'Next'}
          </S.StyledButton>
        </div>
      </S.FlexContainer>
    </>
  );
};

export default WalkThrough;
