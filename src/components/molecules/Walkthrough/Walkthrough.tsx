import {useMemo} from 'react';

import {Popover, PopoverProps} from 'antd';

import {CloseOutlined} from '@ant-design/icons';

import {StepEnum, WalkthroughCollection, WalkthroughContentProps, WalkthroughStep} from '@models/walkthrough';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {cancelWalkthrough, handleWalkthroughStep} from '@redux/reducers/ui';

import * as S from './Walkthrough.styled';
import {newReleaseFeaturesContent, noviceContent} from './content';

type WalkthroughProps<C extends WalkthroughCollection> = {
  step: WalkthroughStep<C>;
  children: React.ReactNode;
  placement?: PopoverProps['placement'];
  collection: C;
};

const walkThroughCollection = {
  novice: noviceContent,
  release: newReleaseFeaturesContent,
};

const WalkthroughTitle = (props: {title: string; collection: WalkthroughCollection}) => {
  const {title, collection} = props;
  const dispatch = useAppDispatch();

  const handleClose = () => {
    dispatch(cancelWalkthrough(collection));
  };

  return (
    <>
      <S.FlexContainer>{title}</S.FlexContainer>
      <S.CloseButton id="close-walkthrough" onClick={handleClose} icon={<CloseOutlined />} />
    </>
  );
};

const WalkthroughContent = (props: WalkthroughContentProps) => {
  const {data, currentStep, collection} = props;
  const dispatch = useAppDispatch();

  const handleStep = (step: number) => {
    dispatch(handleWalkthroughStep({step, collection}));
  };

  const totalSteps = useMemo(() => walkThroughCollection[collection].length, [collection]);

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

const Walkthrough = <C extends WalkthroughCollection>(props: WalkthroughProps<C>) => {
  const {placement, step, collection, children} = props;
  const walkThroughStep = useAppSelector(state => state.ui.walkThrough[collection].currentStep);
  const data = walkThroughCollection[collection][walkThroughStep] || {};

  return (
    <Popover
      placement={placement}
      content={<WalkthroughContent data={data} currentStep={walkThroughStep} collection={collection} />}
      title={<WalkthroughTitle title={data.title} collection={collection} />}
      visible={data.step === step}
      overlayClassName="walkthrough"
    >
      {children}
    </Popover>
  );
};

export default Walkthrough;
