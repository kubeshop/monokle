import {useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectImage} from '@redux/reducers/main';
import {isImageHighlighted, isImageSelected} from '@redux/services/image';

import ImageQuickAction from './ImageQuickAction';
import * as S from './ImageRenderer.styled';
import ImageSuffix from './ImageSuffix';

type IProps = {
  id: string;
};

const ImageRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const image = useAppSelector(state => state.main.imageMap[id]);
  const isHighlighted = useAppSelector(state => isImageHighlighted(id, state.main.highlights));
  const isSelected = useAppSelector(state => isImageSelected(id, state.main.selection));

  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <S.ItemContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isHovered={isHovered}
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      onClick={() => dispatch(selectImage({imageId: id}))}
    >
      <S.ItemName isSelected={isSelected} isHighlighted={isHighlighted}>
        {id}
      </S.ItemName>

      <S.SuffixContainer>
        <ImageSuffix resourcesIds={image.resourcesIds} isSelected={isSelected} />
      </S.SuffixContainer>

      {isHovered && <ImageQuickAction id={id} isSelected={isSelected} />}
    </S.ItemContainer>
  );
};

export default ImageRenderer;
