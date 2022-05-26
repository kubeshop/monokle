import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import * as S from './ImageDetails.styled';

const ImageDetails: React.FC = () => {
  const selectedImage = useAppSelector(state => state.main.selectedImage);

  if (!selectedImage) {
    return null;
  }

  return (
    <>
      <S.ImageName>
        <Icon name="images" style={{fontSize: 20, paddingTop: '4px'}} />
        {selectedImage.name}:{selectedImage.tag}
      </S.ImageName>
    </>
  );
};

export default ImageDetails;
