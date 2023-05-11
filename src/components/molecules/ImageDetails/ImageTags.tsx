import {useCallback, useEffect, useState} from 'react';

import {Skeleton, Tooltip} from 'antd';

import {debounce} from 'lodash';

import {TOOLTIP_DELAY} from '@constants/constants';
import {ImageTagTooltip} from '@constants/tooltips';

import {DockerHubImageTags} from '@shared/models/image';
import {isEqual} from '@shared/utils/isEqual';
import {openUrlInExternalBrowser} from '@shared/utils/shell';

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
  const [searchedValue, setSearchedValue] = useState<string>('');
  const [tags, setTags] = useState<DockerHubImageTags>(initialTags);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(nextValue => setSearchedValue(nextValue), 200),
    []
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.persist();
    const {value: nextValue} = event.target;
    debouncedSearch(nextValue);
  };

  useEffect(() => {
    if (!tags || !initialTags || (isEqual(tags, initialTags) && pageNumber === 1 && !searchedValue)) {
      return;
    }

    const fetchTags = async () => {
      setIsLoading(true);

      const response = await fetch(
        `https://hub.docker.com/v2/repositories/${user}/${name}/tags?page=${pageNumber}&page_size=50&name=${searchedValue}`,
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
  }, [pageNumber, searchedValue]);

  return (
    <>
      <S.SearchInput placeholder="Search image tag" onChange={handleSearch} />

      {isLoading ? (
        <Skeleton active />
      ) : (
        <S.ImageTagsContainer>
          {tags.results.length ? (
            tags.results.map(tag => (
              <Tooltip key={tag.id} title={ImageTagTooltip} mouseEnterDelay={TOOLTIP_DELAY}>
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
            ))
          ) : (
            <S.NotFoundLabel>No tags were found.</S.NotFoundLabel>
          )}
        </S.ImageTagsContainer>
      )}

      <S.Pagination
        onChange={page => {
          if (page !== pageNumber) {
            setPageNumber(page);
          }
        }}
        hideOnSinglePage
        showSizeChanger={false}
        pageSize={50}
        total={tags.count}
      />
    </>
  );
};

export default ImageTags;
