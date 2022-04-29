import {useMemo} from 'react';

import {Popover, PopoverProps} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {cancelWalkThrough, handleWalkThroughStep} from '@redux/reducers/ui';

import {StepEnum, WalkThroughContentProps, WalkThroughStep} from './types';
import {walkThroughContent} from './walkThroughContent';

import * as S from './styled';

type WalkThroughProps = {
  step: WalkThroughStep;
  children: React.ReactNode;
  placement?: PopoverProps['placement'];
};

const WalkThroughTitle = (props: {title: string}) => {
  const {title} = props;
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(cancelWalkThrough());
  };

  return (
    <>
      <S.FlexContainer>{title}</S.FlexContainer>
      <S.CloseButton id="close-walkthrough" onClick={handleClose} icon={<CloseOutlined />} />
    </>
  );
};

const WalkThroughContent = (props: WalkThroughContentProps) => {
  const {data, currentStep} = props;
  const dispatch = useAppDispatch();

  const handleStep = (step: number) => {
    dispatch(handleWalkThroughStep(step));
  };

  const totalSteps = useMemo(() => walkThroughContent.length, []);
  return (
    <>
      <S.Description>{data.content}</S.Description>
      <S.FlexContainer>
        <S.Container>
          {currentStep + 1} of {totalSteps}
        </S.Container>
        <S.Container>
          {currentStep !== 0 && <S.StyledButton onClick={() => handleStep(StepEnum.Previous)}>Previous</S.StyledButton>}
          <S.StyledButton type="primary" onClick={() => handleStep(StepEnum.Next)}>
            {totalSteps - 1 === currentStep ? 'Got it!' : 'Next'}
          </S.StyledButton>
        </S.Container>
      </S.FlexContainer>
    </>
  );
};

const WalkThrough = (props: WalkThroughProps) => {
  const {placement, children, step} = props;
  const walkThroughStep = useAppSelector(state => state.ui.walkThrough.currentStep);
  const data = walkThroughContent[walkThroughStep] || {};

  return (
    <Popover
      placement={placement}
      content={<WalkThroughContent data={data} currentStep={walkThroughStep} />}
      title={<WalkThroughTitle title={data.title} />}
      visible={data.step === step}
      overlayClassName="walkthrough"
    >
      {children}
    </Popover>
  );
};

export default WalkThrough;
