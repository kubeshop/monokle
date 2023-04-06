import {memo, useState} from 'react';

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
  const fileOrFolderContainedIn = useAppSelector(state => state.main.resourceFilter.fileOrFolderContainedIn || '');
  const helmChart = useAppSelector(state => state.main.helmChartMap[id]);
  const isDisabled = useAppSelector(state =>
    Boolean(
      (state.main.preview?.type === 'helm' &&
        state.main.preview.valuesFileId &&
        state.main.preview.valuesFileId !== helmChart.id) ||
        isInClusterModeSelector(state) ||
        !helmChart.filePath.startsWith(fileOrFolderContainedIn)
    )
  );
  const isSelected = useAppSelector(
    state => state.main.selection?.type === 'file' && state.main.selection.filePath === helmChart.filePath
  );

  const [isHovered, setIsHovered] = useState<boolean>(false);

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
        <Icon name="helm" style={{color: isSelected ? Colors.blackPure : Colors.grey9, fontSize: '16px'}} />
      </S.PrefixContainer>

      <S.ItemName isDisabled={isDisabled} isSelected={isSelected}>
        {helmChart.name}
      </S.ItemName>

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
