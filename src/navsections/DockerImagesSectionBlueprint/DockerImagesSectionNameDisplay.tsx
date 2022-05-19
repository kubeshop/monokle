import {useState} from 'react';
import {useDebounce} from 'react-use';

import {SectionInstance} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setImagesSearchedValue} from '@redux/reducers/main';

import * as S from './DockerImagesSectionNameDisplay.styled';

interface IProps {
  sectionInstance: SectionInstance;
}

const DockerImagesSectionNameDisplay: React.FC<IProps> = props => {
  const {
    sectionInstance: {itemIds},
  } = props;

  const dispatch = useAppDispatch();
  const searchedValue = useAppSelector(state => state.main.imagesSearchedValue);

  const [value, setValue] = useState(searchedValue);

  useDebounce(
    () => {
      if (value) {
        dispatch(setImagesSearchedValue(value));
      } else {
        dispatch(setImagesSearchedValue(''));
      }
    },
    200,
    [value]
  );

  return (
    <S.NameDisplayContainer>
      <div>
        <S.ImagesCount>{itemIds.length} images in your project</S.ImagesCount>
        <S.HelperLabel>Find out where they are used and get + info</S.HelperLabel>
      </div>

      <S.SearchInput placeholder="Search project images" value={value} onChange={e => setValue(e.target.value)} />
    </S.NameDisplayContainer>
  );
};

export default DockerImagesSectionNameDisplay;
