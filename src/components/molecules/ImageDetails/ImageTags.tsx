import {useEffect, useState} from 'react';

import {Skeleton, Tooltip} from 'antd';

import {isEqual} from 'lodash';

import {ImageTagTooltip} from '@constants/tooltips';

import {DockerHubImageTags} from '@models/image';

import {openUrlInExternalBrowser} from '@utils/shell';

import * as S from './ImageTags.styled';

interface IProps {
  name: string;
  initialTags: DockerHubImageTags;
  user: string;
}

const ImageTags: React.FC<IProps> = props => {
  const {initialTags, name, user} = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [tags, setTags] = useState<DockerHubImageTags>(initialTags);

  useEffect(() => {
    if (!tags || !initialTags || (isEqual(tags, initialTags) && pageNumber === 1)) {
      return;
    }

    const fetchTags = async () => {
      setIsLoading(true);

      const response = await fetch(
        `https://hub.docker.com/v2/repositories/${user}/${name}/tags?page=${pageNumber}&page_size=50`,
        {method: 'GET'}
      );

      if (response.ok) {
        const data = await response.json();

        setTags(data);
      }

      setIsLoading(false);
    };

    fetchTags();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber]);

  return (
    <>
      {isLoading ? (
        <Skeleton />
      ) : (
        <S.ImageTagsContainer>
          {tags.results.map(tag => (
            <Tooltip key={tag.id} title={ImageTagTooltip}>
              <S.Tag
                onClick={() =>
                  openUrlInExternalBrowser(
                    `https://hub.docker.com/layers/${name}/${user}/${name}/${tag.name}/images/${tag.images[0].digest}?content=explore`
                  )
                }
              >
                {tag.name}
              </S.Tag>
            </Tooltip>
          ))}
        </S.ImageTagsContainer>
      )}

      <S.Pagination
        onChange={page => {
          if (page !== pageNumber) {
            setPageNumber(page);
          }
        }}
        showSizeChanger={false}
        pageSize={50}
        total={tags.count}
      />
    </>
  );
};

export default ImageTags;
