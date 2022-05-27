import {useEffect, useState} from 'react';

import {Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import * as S from './ImageDetails.styled';

const ImageDetails: React.FC = () => {
  const selectedImage = useAppSelector(state => state.main.selectedImage);

  const [isLoading, setIsLoading] = useState(true);
  const [imageInfo, setImageInfo] = useState<Record<string, any>>();

  useEffect(() => {
    if (!selectedImage) {
      setIsLoading(false);
      return;
    }

    const fetchImageInfo = async () => {
      setIsLoading(true);
      const {name, user} = getImageUserAndName(selectedImage.name);

      const response = await fetch(`https://hub.docker.com/v2/repositories/${user}/${name}`, {method: 'GET'});

      if (response.ok) {
        const data = await response.json();

        setImageInfo(data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    fetchImageInfo();
  }, [selectedImage]);

  if (!selectedImage) {
    return null;
  }

  return (
    <>
      {isLoading ? (
        <div style={{padding: '10px'}}>
          <Skeleton />
        </div>
      ) : imageInfo ? (
        <>
          <S.ImageName>
            <Icon name="images" style={{fontSize: 20, paddingTop: '4px'}} />
            {selectedImage.name}:{selectedImage.tag}
            <S.ImageExtraInfoContainer>
              <S.StarFilled />
              {imageInfo?.['star_count']}

              <S.PullRequestOutlined />
              {imageInfo?.['pull_count']}
            </S.ImageExtraInfoContainer>
          </S.ImageName>

          <S.ImageDetailsContainer>test</S.ImageDetailsContainer>
        </>
      ) : null}
    </>
  );
};

const getImageUserAndName = (image: string) => {
  if (!image) {
    return {user: '', name: ''};
  }

  const imageSplit = image.split('/');

  if (imageSplit.length === 1) {
    return {user: 'library', name: imageSplit[0]};
  }

  const [user, name] = imageSplit.slice(-2);

  return {user, name};
};

export default ImageDetails;
