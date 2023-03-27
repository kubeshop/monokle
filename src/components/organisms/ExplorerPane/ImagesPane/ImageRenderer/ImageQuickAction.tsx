import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openReplaceImageModal} from '@redux/reducers/ui';
import {isInPreviewModeSelectorNew} from '@redux/selectors';

import * as S from './ImageQuickAction.styled';

type IProps = {
  id: string;
  isSelected: boolean;
};

const ImageQuickAction: React.FC<IProps> = props => {
  const {id, isSelected} = props;

  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const onReplaceHandler = () => {
    if (isInPreviewMode || isInClusterMode) {
      return;
    }

    dispatch(openReplaceImageModal(id));
  };

  return (
    <S.ReplaceSpan $isDisabled={isInPreviewMode || isInClusterMode} $isSelected={isSelected} onClick={onReplaceHandler}>
      Replace
    </S.ReplaceSpan>
  );
};

export default ImageQuickAction;
