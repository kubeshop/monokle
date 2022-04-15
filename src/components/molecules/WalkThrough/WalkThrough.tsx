import {useMemo} from 'react';

import {Popover} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {cancelWalkThrough, handleWalkThroughStep} from '@redux/reducers/ui';

import {walkThroughContent} from './walkThroughContent';

import * as S from './styled';

export enum StepEnum {
  Previous = -1,
  Next = 1,
}

type WalkThroughTitleProps = {
  title: string;
};

const WalkThroughTitle = (props: WalkThroughTitleProps) => {
  const {title} = props;
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(cancelWalkThrough());
  };

  return (
    <>
      <S.FlexContainer>{title}</S.FlexContainer>
      <S.CloseButton onClick={handleClose} icon={<CloseOutlined />} />
    </>
  );
};

type WalkThroughContentProps = {
  currentStep: number;
  data: {
    content: string;
    step: string;
  };
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
        <div>
          {currentStep + 1} of {totalSteps}
        </div>
        <div>
          {currentStep !== 0 && <S.StyledButton onClick={() => handleStep(StepEnum.Previous)}>Previous</S.StyledButton>}
          <S.StyledButton type="primary" onClick={() => handleStep(StepEnum.Next)}>
            {totalSteps === currentStep ? 'Got it!' : 'Next'}
          </S.StyledButton>
        </div>
      </S.FlexContainer>
    </>
  );
};

type WalkThroughProps = {
  step: 'template' | 'resource' | 'syntax' | 'cluster' | 'kustomizeHelm';
  children: React.ReactNode;
  placement?: any; // TODO: update it
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
