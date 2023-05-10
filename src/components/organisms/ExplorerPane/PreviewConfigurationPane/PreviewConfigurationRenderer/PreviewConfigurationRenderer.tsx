import {memo, useState} from 'react';

import {EyeOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectPreviewConfiguration} from '@redux/reducers/main';

import {Colors} from '@shared/styles/colors';
import {trackEvent} from '@shared/utils';
import {isInClusterModeSelector} from '@shared/utils/selectors';

import PreviewConfigurationQuickAction from './PreviewConfigurationQuickAction';
import * as S from './PreviewConfigurationRenderer.styled';

type IProps = {
  id: string;
};

const PreviewConfigurationRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const previewConfiguration = useAppSelector(state => state.config.projectConfig?.helm?.previewConfigurationMap?.[id]);
  const isDisabled = useAppSelector(isInClusterModeSelector);
  const isSelected = useAppSelector(
    state =>
      state.main.selection?.type === 'preview.configuration' &&
      state.main.selection.previewConfigurationId === previewConfiguration?.id
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!previewConfiguration) {
    return null;
  }

  return (
    <S.ItemContainer
      isDisabled={isDisabled}
      isHovered={isHovered}
      isSelected={isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(selectPreviewConfiguration({previewConfigurationId: id}));
        trackEvent('explore/select_preview_configuration');
      }}
    >
      <S.PrefixContainer>
        <EyeOutlined style={{color: isSelected ? Colors.blackPure : Colors.grey9}} />
      </S.PrefixContainer>

      <S.ItemName isDisabled={isDisabled} isSelected={isSelected}>
        {previewConfiguration.name}
      </S.ItemName>

      <div
        style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <S.QuickActionContainer>
          <PreviewConfigurationQuickAction id={previewConfiguration.id} isSelected={isSelected} />
        </S.QuickActionContainer>
      </div>
    </S.ItemContainer>
  );
};

export default memo(PreviewConfigurationRenderer);
