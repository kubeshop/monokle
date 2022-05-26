import {useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';

import {Skeleton} from 'antd';

import {useAppSelector} from '@redux/hooks';

import {Icon} from '@atoms';

import {openUrlInExternalBrowser} from '@utils/shell';

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
      <S.ImageName>
        <Icon name="images" style={{fontSize: 20, paddingTop: '4px'}} />
        {selectedImage.name}:{selectedImage.tag}
      </S.ImageName>

      <S.ImageDetailsContainer>
        {isLoading ? (
          <Skeleton />
        ) : imageInfo ? (
          <ReactMarkdown
            components={{
              a({href, children, ...restProps}) {
                return (
                  <a onClick={() => openUrlInExternalBrowser(href)} {...restProps}>
                    {children}
                  </a>
                );
              },
            }}
          >
            {imageInfo['full_description']}
          </ReactMarkdown>
        ) : null}
      </S.ImageDetailsContainer>
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
