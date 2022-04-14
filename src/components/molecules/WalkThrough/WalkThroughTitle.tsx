import {CloseOutlined} from '@ant-design/icons';

import {useAppDispatch} from '@redux/hooks';
import {cancelWalkThrough} from '@redux/reducers/ui';

import * as S from './styled';

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

export default WalkThroughTitle;
