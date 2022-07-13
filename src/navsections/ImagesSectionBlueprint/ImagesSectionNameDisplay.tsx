import {useMemo, useState} from 'react';
import {useDebounce} from 'react-use';

import {SectionInstance} from '@models/navigator';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setImagesSearchedValue} from '@redux/reducers/main';
import {isInClusterModeSelector, isInPreviewModeSelector, kubeConfigContextColorSelector} from '@redux/selectors';

import * as S from './ImagesSectionNameDisplay.styled';

interface IProps {
  sectionInstance: SectionInstance;
}

const ImagesSectionNameDisplay: React.FC<IProps> = props => {
  const {
    sectionInstance: {itemIds},
  } = props;

  const dispatch = useAppDispatch();
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);
  const kubeConfigContextColor = useAppSelector(kubeConfigContextColorSelector);
  const searchedValue = useAppSelector(state => state.main.imagesSearchedValue);

  const [value, setValue] = useState(searchedValue);

  const OutputTag = useMemo(() => {
    if (isInClusterMode) {
      return (
        <S.ClusterOutputTag $kubeConfigContextColor={kubeConfigContextColor}>
          Filtered by Cluster Mode
        </S.ClusterOutputTag>
      );
    }

    if (isInPreviewMode) {
      return <S.PreviewOutputTag>Filtered By Preview Mode</S.PreviewOutputTag>;
    }

    return null;
  }, [isInClusterMode, isInPreviewMode, kubeConfigContextColor]);

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
        {OutputTag}
      </div>

      <S.SearchInput placeholder="Search project images" value={value} onChange={e => setValue(e.target.value)} />
    </S.NameDisplayContainer>
  );
};

export default ImagesSectionNameDisplay;
