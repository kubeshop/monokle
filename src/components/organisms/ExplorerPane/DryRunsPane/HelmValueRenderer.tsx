import {memo, useState} from 'react';

import {useAppSelector} from '@redux/hooks';

import {HelmPreview} from '@shared/models/preview';

import {usePreviewTrigger} from './usePreviewTrigger';

import * as S from './styled';

type IProps = {
  id: string;
};

const HelmValuesRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const helmValues = useAppSelector(state => state.main.helmValuesMap[id]);

  const isPreviewed = useAppSelector(
    state => state.main.preview?.type === 'helm' && state.main.preview?.valuesFileId === helmValues.id
  );
  const thisPreview: HelmPreview = {type: 'helm', chartId: helmValues.helmChartId, valuesFileId: id};
  const {isOptimisticLoading, triggerPreview, renderPreviewControls} = usePreviewTrigger(thisPreview);
  const mightBePreview = isPreviewed || isOptimisticLoading;

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!helmValues) return null;

  return (
    <S.ItemContainer
      indent={22}
      isHovered={isHovered}
      isPreviewed={mightBePreview}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={triggerPreview}
    >
      <S.ItemName isPreviewed={mightBePreview}>{helmValues.name}</S.ItemName>
      {isOptimisticLoading && <S.ReloadIcon spin />}
      {renderPreviewControls()}
    </S.ItemContainer>
  );
};

export default memo(HelmValuesRenderer);
