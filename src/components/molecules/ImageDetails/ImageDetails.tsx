import {useEffect, useState} from 'react';

import {Skeleton} from 'antd';

import numeral from 'numeral';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import {DockerHubImage, DockerHubImageTags} from '@shared/models/image';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

import * as S from './ImageDetails.styled';
import ImageTags from './ImageTags';

const ImageDetails: React.FC = () => {
  const selectedImage = useAppSelector(state => state.main.selectedImage);

  const [isLoading, setIsLoading] = useState(true);
  const [imageInfo, setImageInfo] = useState<DockerHubImage>();
  const [initialImageTags, setInitialImageTags] = useState<DockerHubImageTags>();
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (!selectedImage) {
      setIsLoading(false);
      return;
    }

    const fetchImageInfo = async () => {
      setIsLoading(true);
      const {name, user} = getImageUserAndName(selectedImage.name);

      const [infoResponse, tagsResponse] = await Promise.all([
        fetch(`https://hub.docker.com/v2/repositories/${user}/${name}`, {method: 'GET'}),
        fetch(`https://hub.docker.com/v2/repositories/${user}/${name}/tags?page_size=50`, {
          method: 'GET',
        }),
      ]);

      if (infoResponse.ok && tagsResponse.ok) {
        const [infoData, tagsData] = await Promise.all([infoResponse.json(), tagsResponse.json()]);

        setImageInfo(infoData);
        setInitialImageTags(tagsData);
        setImageUrl(`https://hub.docker.com/r/${user}/${name}`);
      } else {
        setImageInfo(undefined);
      }

      setIsLoading(false);
    };

    fetchImageInfo();
  }, [selectedImage]);

  if (!selectedImage) {
    return null;
  }

  const {name, user} = getImageUserAndName(selectedImage.name);

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
              {numeral(imageInfo['star_count']).format('0.0a')}

              <S.PullRequestOutlined />
              {numeral(imageInfo['pull_count']).format('0.0a')}
            </S.ImageExtraInfoContainer>
          </S.ImageName>

          <S.ImageDetailsContainer>
            {imageUrl && (
              <S.SectionContainer>
                <a onClick={() => openUrlInExternalBrowser(imageUrl)}>{imageUrl}</a>
              </S.SectionContainer>
            )}

            {initialImageTags?.results.length && (
              <S.SectionContainer>
                <S.SectionTitle>Tags</S.SectionTitle>

                <ImageTags name={name} user={user} initialTags={initialImageTags} />
              </S.SectionContainer>
            )}

            {imageInfo.description && (
              <S.SectionContainer>
                <S.SectionTitle>Description</S.SectionTitle>
                {imageInfo.description}
              </S.SectionContainer>
            )}
          </S.ImageDetailsContainer>
        </>
      ) : (
        <S.NotFoundLabel>No data could be retrieved.</S.NotFoundLabel>
      )}
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
