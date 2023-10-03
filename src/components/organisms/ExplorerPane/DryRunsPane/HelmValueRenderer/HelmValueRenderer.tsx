import {memo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';

import {trackEvent} from '@shared/utils';

import HelmContextMenu from './HelmContextMenu';
import HelmValueQuickAction from './HelmValueQuickAction';
import * as S from './HelmValueRenderer.styled';

type IProps = {
  id: string;
};

const HelmValueRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const helmValue = useAppSelector(state => state.main.helmValuesMap[id]);
  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'helm.values.file' && state.main.selection.valuesFileId === helmValue.id
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!helmValue) return null;

  return (
    <S.ItemContainer
      isHovered={isHovered}
      isSelected={isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(selectHelmValuesFile({valuesFileId: id}));
        trackEvent('explore/select_values_file');
      }}
    >
      <S.ItemName isSelected={isSelected}>{helmValue.name}</S.ItemName>

      <div
        style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <S.QuickActionContainer>
          <HelmValueQuickAction id={helmValue.id} isSelected={isSelected} />
        </S.QuickActionContainer>

        {isHovered ? (
          <S.ContextMenuContainer>
            <HelmContextMenu id={id} isSelected={isSelected} />
          </S.ContextMenuContainer>
        ) : (
          <S.ContextMenuPlaceholder />
        )}
      </div>
    </S.ItemContainer>
  );
};

export default memo(HelmValueRenderer);
