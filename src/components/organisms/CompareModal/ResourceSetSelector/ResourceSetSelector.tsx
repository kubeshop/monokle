import {useCallback} from 'react';

import {Button, Space, Tooltip} from 'antd';

import {ClearOutlined, ReloadOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {
  resourceSetCleared,
  resourceSetRefreshed,
  selectCompareStatus,
  selectResourceSet,
} from '@redux/reducers/compare';

import {ClusterContextSelect} from './ClusterContextSelect';
import {HelmChartSelect} from './HelmChartSelect';
import {HelmValuesSelect} from './HelmValuesSelect';
import {KustomizeSelect} from './KustomizeSelect';
import * as S from './ResourceSetSelector.styled';
import {ResourceSetTypeSelect} from './ResourceSetTypeSelect';

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetSelector: React.FC<Props> = ({side}: Props) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectCompareStatus(state.compare));
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));

  const handleRefresh = useCallback(() => {
    dispatch(resourceSetRefreshed({side}));
  }, [dispatch, side]);

  const handleClear = useCallback(() => {
    dispatch(resourceSetCleared({side}));
  }, [dispatch, side]);

  return (
    <S.ResourceSetSelectorDiv>
      <S.SelectSpacer>
        <ResourceSetTypeSelect side={side} />
        {resourceSet?.type === 'helm' && (
          <Space wrap>
            <HelmChartSelect side={side} />
            <HelmValuesSelect side={side} />
          </Space>
        )}
        {resourceSet?.type === 'kustomize' && (
          <S.KustomizeSelectContainer>
            <KustomizeSelect side={side} />
          </S.KustomizeSelectContainer>
        )}
        {resourceSet?.type === 'cluster' && <ClusterContextSelect side={side} />}
      </S.SelectSpacer>

      <S.ActionsDiv>
        <Tooltip title="Reload resources" placement="bottom">
          <Button
            type="link"
            size="middle"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={status === 'transfering'}
          />
        </Tooltip>

        <Tooltip title="Clear resources" placement="bottom">
          <Button
            type="link"
            size="middle"
            icon={<ClearOutlined />}
            onClick={handleClear}
            disabled={status === 'transfering'}
          />
        </Tooltip>
      </S.ActionsDiv>
    </S.ResourceSetSelectorDiv>
  );
};
