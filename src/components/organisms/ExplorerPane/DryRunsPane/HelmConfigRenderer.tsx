import {memo, useCallback, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openPreviewConfigurationEditor} from '@redux/reducers/main';

import {HelmConfigPreview} from '@shared/models/preview';

import {usePreviewTrigger} from './usePreviewTrigger';

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
  const thisPreview: HelmConfigPreview = {type: 'helm-config', configId: id};
  const {isOptimisticLoading, triggerPreview, renderPreviewControls} = usePreviewTrigger(thisPreview);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const mightBePreview = isPreviewed || isOptimisticLoading;

  const helmChart = useAppSelector(state =>
    previewConfiguration
      ? Object.values(state.main.helmChartMap).find(h => h.filePath === previewConfiguration.helmChartFilePath)
      : undefined
  );

  const onClickEdit = useCallback(() => {
    if (!previewConfiguration || !helmChart) {
      return;
    }

    dispatch(
      openPreviewConfigurationEditor({helmChartId: helmChart.id, previewConfigurationId: previewConfiguration.id})
    );
  }, [previewConfiguration, helmChart, dispatch]);

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
      <S.EditIcon onClick={onClickEdit} />
      {renderPreviewControls()}
    </S.ItemContainer>
  );
};

export default memo(HelmConfigRenderer);
