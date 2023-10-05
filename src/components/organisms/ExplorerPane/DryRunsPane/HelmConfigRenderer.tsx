import {memo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {startPreview} from '@redux/thunks/preview';

import * as S from './styled';

type IProps = {
  id: string;
};

const HelmConfigRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const previewConfiguration = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap?.[id]);
  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'helm-config' && state.main.preview.configId === previewConfiguration?.id
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!previewConfiguration) {
    return null;
  }

  return (
    <S.ItemContainer
      indent={22}
      isHovered={isHovered}
      isPreviewed={isPreviewed}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(startPreview({type: 'helm-config', configId: id}));
      }}
    >
      <S.ItemName isPreviewed={isPreviewed}>{previewConfiguration.name}</S.ItemName>
    </S.ItemContainer>
  );
};

export default memo(HelmConfigRenderer);
