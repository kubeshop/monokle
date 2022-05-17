import {ItemCustomComponentProps} from '@models/navigator';

import {useAppDispatch} from '@redux/hooks';
import {openReplaceImageModal} from '@redux/reducers/ui';

import * as S from './DockerImagesQuickAction.styled';

const DockerImagesQuickAction: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();

  const onReplaceHandler = () => {
    dispatch(openReplaceImageModal());
  };

  return (
    <S.ReplaceSpan $isSelected={itemInstance.isSelected} onClick={onReplaceHandler}>
      Replace
    </S.ReplaceSpan>
  );
};

export default DockerImagesQuickAction;
