import {ItemInstance} from '@models/navigator';

import * as S from './ImagesSectionNameSuffix.styled';

interface IProps {
  itemInstance: ItemInstance;
}

const ImagesSectionNameSuffix: React.FC<IProps> = props => {
  const {
    itemInstance: {
      isSelected,
      meta: {resourcesIds},
    },
  } = props;

  return <S.Counter $selected={isSelected}>{resourcesIds.length}</S.Counter>;
};

export default ImagesSectionNameSuffix;
