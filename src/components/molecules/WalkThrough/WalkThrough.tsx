import {useMemo} from 'react';

import {Popover, PopoverProps} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {cancelWalkThrough, handleWalkThroughStep} from '@redux/reducers/ui';

import {newReleaseFeatureContent} from './newReleaseFeaturesContent';
import {StepEnum, WalkThroughCollection, WalkThroughContentProps, WalkThroughStep} from './types';
import {walkThroughNoviceContent} from './walkThroughNoviceContent';

import * as S from './styled';

type WalkThroughProps<C extends WalkThroughCollection> = {
  step: WalkThroughStep<C>;
  children: React.ReactNode;
  placement?: PopoverProps['placement'];
  collection: C;
};

const walkThroughCollection = {
  novice: walkThroughNoviceContent,
  release: newReleaseFeatureContent,
};

const WalkThroughTitle = (props: {title: string; collection: WalkThroughCollection}) => {
  const {title, collection} = props;
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(cancelWalkThrough(collection));
  };

  return (
    <>
      <S.FlexContainer>{title}</S.FlexContainer>
      <S.CloseButton id="close-walkthrough" onClick={handleClose} icon={<CloseOutlined />} />
    </>
  );
};

const WalkThroughContent = (props: WalkThroughContentProps) => {
  const {data, currentStep, collection} = props;
  const dispatch = useAppDispatch();

  const handleStep = (step: number) => {
    dispatch(handleWalkThroughStep({step, collection}));
  };

  const totalSteps = useMemo(() => walkThroughCollection[collection].length, []);
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

const WalkThrough = <C extends WalkThroughCollection>(props: WalkThroughProps<C>) => {
  const {placement, step, collection, children} = props;
  const walkThroughStep = useAppSelector(state => state.ui.walkThrough[collection].currentStep);
  const data = walkThroughCollection[collection][walkThroughStep] || {};

  return (
    <Popover
      placement={placement}
      content={<WalkThroughContent data={data} currentStep={walkThroughStep} collection={collection} />}
      title={<WalkThroughTitle title={data.title} collection={collection} />}
      visible={data.step === step}
      overlayClassName="walkthrough"
    >
      {children}
    </Popover>
  );
};

export default WalkThrough;
