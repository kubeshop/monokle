import {memo, useState} from 'react';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';

import {isInClusterModeSelector} from '@shared/utils/selectors';

import HelmContextMenu from '../HelmContextMenu';
import HelmValueQuickAction from './HelmValueQuickAction';
import * as S from './HelmValueRenderer.styled';

type IProps = {
  id: string;
};

const HelmValueRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const fileOrFolderContainedIn = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn || '');
  const helmValue = useAppSelector(state => state.main.helmValuesMap[id]);
  const isDisabled = useAppSelector(state =>
    Boolean(
      (state.main.preview?.type === 'helm' &&
        state.main.preview.valuesFileId &&
        state.main.preview.valuesFileId !== helmValue.id) ||
        isInClusterModeSelector(state) ||
        !helmValue.filePath.startsWith(fileOrFolderContainedIn)
    )
  );
  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'helm.values.file' && state.main.selection.valuesFileId === helmValue.id
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!helmValue) return null;

  return (
    <S.ItemContainer
      isDisabled={isDisabled}
      isHovered={isHovered}
      isSelected={isSelected}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => dispatch(selectHelmValuesFile({valuesFileId: id}))}
    >
      <S.ItemName isDisabled={isDisabled} isSelected={isSelected}>
        {helmValue.name}
      </S.ItemName>

      {isHovered && (
        <div
          style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <S.QuickActionContainer>
            <HelmValueQuickAction id={helmValue.id} isSelected={isSelected} />
          </S.QuickActionContainer>

          <S.ContextMenuContainer>
            <HelmContextMenu id={id} isSelected={isSelected} />
          </S.ContextMenuContainer>
        </div>
      )}
    </S.ItemContainer>
  );
};

export default memo(HelmValueRenderer);
