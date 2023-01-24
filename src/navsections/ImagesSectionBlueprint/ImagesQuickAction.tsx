import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openReplaceImageModal} from '@redux/reducers/ui';
import {isInClusterModeSelector} from '@redux/selectors';

import {ItemCustomComponentProps} from '@shared/models/navigator';
import {isInPreviewModeSelectorNew} from '@shared/utils/selectors';

import * as S from './ImagesQuickAction.styled';

const ImagesQuickAction: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const dispatch = useAppDispatch();
  const isInPreviewMode = useAppSelector(isInPreviewModeSelectorNew);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);

  const onReplaceHandler = () => {
    if (isInPreviewMode) {
      return;
    }

    dispatch(openReplaceImageModal(itemInstance.id));
  };

  return (
    <S.ReplaceSpan
      $isDisabled={isInPreviewMode || isInClusterMode}
      $isSelected={itemInstance.isSelected}
      onClick={onReplaceHandler}
    >
      Replace
    </S.ReplaceSpan>
  );
};

export default ImagesQuickAction;
