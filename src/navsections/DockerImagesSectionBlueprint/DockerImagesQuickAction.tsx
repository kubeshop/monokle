import {ItemCustomComponentProps} from '@models/navigator';

import * as S from './DockerImagesQuickAction.styled';

const DockerImagesQuickAction: React.FC<ItemCustomComponentProps> = props => {
  const {itemInstance} = props;

  const onReplaceHandler = () => {
    console.log('Showing modal');
  };

  return (
    <S.ReplaceSpan $isSelected={itemInstance.isSelected} onClick={onReplaceHandler}>
      Replace
    </S.ReplaceSpan>
  );
};

export default DockerImagesQuickAction;
