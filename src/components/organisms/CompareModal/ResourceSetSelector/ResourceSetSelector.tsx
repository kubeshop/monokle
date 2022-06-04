import {useCallback} from 'react';

import {Button, Tooltip} from 'antd';

import {ClearOutlined, ReloadOutlined} from '@ant-design/icons';

import {TOOLTIP_DELAY} from '@constants/constants';

import {resourceSetCleared, resourceSetRefreshed, selectCompareStatus, selectResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';

import {ClusterContextSelect} from './ClusterContextSelect';
import {HelmSelect} from './HelmSelect';
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
        {resourceSet && ['helm', 'helm-custom'].includes(resourceSet.type) && <HelmSelect side={side} />}
        {resourceSet?.type === 'kustomize' && (
          <S.KustomizeSelectContainer>
            <KustomizeSelect side={side} />
          </S.KustomizeSelectContainer>
        )}
        {resourceSet?.type === 'cluster' && <ClusterContextSelect side={side} />}
      </S.SelectSpacer>

      <S.ActionsDiv>
        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Reload resources" placement="bottom">
          <Button
            type="link"
            size="middle"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            disabled={status === 'transfering'}
          />
        </Tooltip>

        <Tooltip mouseEnterDelay={TOOLTIP_DELAY} title="Clear resources" placement="bottom">
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
