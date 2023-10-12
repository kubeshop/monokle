import {memo, useMemo, useState} from 'react';

import styled from 'styled-components';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {selectFile} from '@redux/reducers/main';

import {Icon} from '@monokle/components';
import {trackEvent} from '@shared/utils';

import HelmContextMenu from './HelmContextMenu';

import * as S from './styled';

type IProps = {
  id: string;
};

const HelmChartRenderer: React.FC<IProps> = props => {
  const {id} = props;

  const dispatch = useAppDispatch();
  const helmChartMap = useAppSelector(state => state.main.helmChartMap);
  const helmChart = useAppSelector(state => state.main.helmChartMap[id]);

  const [isHovered, setIsHovered] = useState<boolean>(false);

  const chartName = useMemo(() => {
    let name = helmChart.name;
    let parentChart = helmChart.parentChartId ? helmChartMap[helmChart.parentChartId] : undefined;
    while (parentChart) {
      name = `${parentChart.name}/${name}`;
      parentChart = parentChart.parentChartId ? helmChartMap[parentChart.parentChartId] : undefined;
    }

    return name;
  }, [helmChart, helmChartMap]);

  return (
    <S.ItemContainer
      isPreviewed={false}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        dispatch(selectFile({filePath: helmChart.filePath}));
        trackEvent('explore/select_chart');
      }}
    >
      <Icon name="helm" />

      <Heading>{chartName}</Heading>

      {isHovered && (
        <div
          style={{display: 'flex', alignItems: 'center', marginLeft: 'auto'}}
          onClick={e => {
            e.stopPropagation();
          }}
        >
          <S.ContextMenuContainer>
            <HelmContextMenu id={id} />
          </S.ContextMenuContainer>
        </div>
      )}
    </S.ItemContainer>
  );
};

export default memo(HelmChartRenderer);

const Heading = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  justify-content: left;
`;
