import {memo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {HelmConfigPreview} from '@shared/models/preview';

import {usePreviewTrigger} from './usePreviewTrigger';

import * as S from './styled';

type IProps = {
  id: string;
};

const HelmConfigRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const previewConfiguration = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap?.[id]);
  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'helm-config' && state.main.preview.configId === previewConfiguration?.id
  );
  const thisPreview: HelmConfigPreview = {type: 'helm-config', configId: id};
  const {isOptimisticLoading, triggerPreview} = usePreviewTrigger(thisPreview);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const mightBePreview = isPreviewed || isOptimisticLoading;

  if (!previewConfiguration) {
    return null;
  }

  return (
    <S.ItemContainer
      indent={22}
      isHovered={isHovered}
      isPreviewed={mightBePreview}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={triggerPreview}
    >
      <S.ItemName isPreviewed={mightBePreview}>{previewConfiguration.name}</S.ItemName>
      {isOptimisticLoading && <S.ReloadIcon spin />}
    </S.ItemContainer>
  );
};

export default memo(HelmConfigRenderer);
