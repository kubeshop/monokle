import {memo, useMemo, useState} from 'react';

import {Tooltip} from 'antd';

import {dirname} from 'path';

import {TOOLTIP_DELAY} from '@constants/constants';

import {isInClusterModeSelector} from '@redux/appConfig';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';

import {Icon} from '@monokle/components';
import {Colors} from '@shared/styles/colors';

import HelmContextMenu from '../HelmContextMenu';
import HelmChartCollapse from './HelmChartCollapse';
import * as S from './HelmChartRenderer.styled';

type IProps = {
  id: string;
};

const HelmChartRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const fileOrFolderContainedIn = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn) || '';
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const isInClusterMode = useAppSelector(isInClusterModeSelector);
  const preview = useAppSelector(state => state.main.preview);
  const selection = useAppSelector(state => state.main.selection);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const helmChart = useMemo(() => helmChartMap[id], [helmChartMap, id]);
  const isDisabled = useMemo(() => {
    if (preview?.type === 'helm' && preview.valuesFileId && preview.valuesFileId !== helmChart.id) {
      return true;
    }

    if (isInClusterMode) {
      return true;
    }

    return !helmChart.filePath.startsWith(fileOrFolderContainedIn);
  }, [fileOrFolderContainedIn, helmChart.filePath, helmChart.id, isInClusterMode, preview]);
  const isSelected = useMemo(
    () => selection?.type === 'file' && selection.filePath === helmChart.filePath,
    [helmChart.filePath, selection]
  );

  return (
    <S.ItemContainer
      isDisabled={isDisabled}
      isSelected={isSelected}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => dispatch(selectFile({filePath: helmChart.filePath}))}
    >
      <S.PrefixContainer>
        <HelmChartCollapse id={id} isSelected={isSelected} />
        <Icon name="helm" style={{color: isSelected ? Colors.blackPure : Colors.grey9, fontSize: '18px'}} />
      </S.PrefixContainer>

      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={helmChart.name}>
        <S.ItemName isDisabled={isDisabled} isSelected={isSelected}>
          {helmChart.name}
        </S.ItemName>
      </Tooltip>

      <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title={helmChart.filePath}>
        <S.SuffixContainer isSelected={isSelected}>{dirname(helmChart.filePath)}</S.SuffixContainer>
      </Tooltip>

      {isHovered && (
        <div
          style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <S.ContextMenuContainer>
            <HelmContextMenu id={id} isSelected={isSelected} />
          </S.ContextMenuContainer>
        </div>
      )}
    </S.ItemContainer>
  );
};

export default memo(HelmChartRenderer);
