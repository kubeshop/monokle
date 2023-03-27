import {useState} from 'react';
import {useDebounce} from 'react-use';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setImagesSearchedValue} from '@redux/reducers/main';

import {SearchInput} from '@monokle/components';

const ImageSearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchedValue = useAppSelector(state => state.main.imagesSearchedValue);

  const [value, setValue] = useState<string>(searchedValue ?? '');

  useDebounce(
    () => {
      if (value) {
        dispatch(setImagesSearchedValue(value));
      } else {
        dispatch(setImagesSearchedValue(''));
      }
    },
    250,
    [value]
  );

  return <SearchInput placeholder="Search project images" onChange={(e: any) => setValue(e.target.value)} />;
};

export default ImageSearch;
