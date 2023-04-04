import {memo, useMemo, useState} from 'react';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectHelmValuesFile} from '@redux/reducers/main';

import HelmContextMenu from '../HelmContextMenu';
import HelmValueQuickAction from './HelmValueQuickAction';
import * as S from './HelmValueRenderer.styled';

type IProps = {
  id: string;
};

const HelmValueRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const fileOrFolderContainedIn = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn) || '';
  const helmValuesMap = useAppSelector(state => state.main.helmValuesMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const preview = useAppSelector(state => state.main.preview);
  const selection = useAppSelector(state => state.main.selection);

  const helmValue = useMemo(() => helmValuesMap[id], [helmValuesMap, id]);
  const isDisabled = useMemo(() => {
    if (preview?.type === 'helm' && preview.valuesFileId && preview.valuesFileId !== helmValue.id) {
      return true;
    }

    if (isInClusterMode) {
      return true;
    }

    return !helmValue.filePath.startsWith(fileOrFolderContainedIn);
  }, [fileOrFolderContainedIn, helmValue.filePath, helmValue.id, isInClusterMode, preview]);
  const isSelected = useMemo(
    () => selection?.type === 'helm.values.file' && selection.valuesFileId === helmValue.id,
    [helmValue.id, selection]
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
