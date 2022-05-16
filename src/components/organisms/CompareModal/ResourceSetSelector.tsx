import {useCallback} from 'react';

import {Button, Dropdown, Menu, Tooltip} from 'antd';

import {ClearOutlined, DownOutlined, ReloadOutlined} from '@ant-design/icons';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {ResourceSet, resourceSetCleared, resourceSetRefreshed, resourceSetSelected} from '@redux/reducers/compare';

import * as S from './ResourceSetSelector.styled';

const resourceSetLabelMap: Record<ResourceSet['type'], string> = {
  local: 'Local',
  cluster: 'Cluster',
  helm: 'Helm Preview',
  kustomize: 'Kustomize',
};

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetSelector: React.FC<Props> = ({side}: Props) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => {
    const view = state.compare.current.view;
    return side === 'left' ? view.leftSet : view.rightSet;
  });

  const handleSelect = useCallback(
    (type: string) => {
      const value: ResourceSet = type === 'local' ? {type: 'local'} : {type: 'cluster', context: 'somecontext'};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );

  const handleRefresh = useCallback(() => {
    dispatch(resourceSetRefreshed({side}));
  }, [dispatch, side]);

  const handleClear = useCallback(() => {
    dispatch(resourceSetCleared({side}));
  }, [dispatch, side]);

  const menu = (
    <Menu>
      <Menu.Item key="local" onClick={() => handleSelect('local')}>
        Local
      </Menu.Item>
      <Menu.Item key="cluster" onClick={() => handleSelect('cluster')}>
        Cluster
      </Menu.Item>
    </Menu>
  );

  return (
    <S.DiffSetSelectorDiv>
      <Dropdown overlay={menu}>
        <Button style={{width: 180, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          {resourceSet ? resourceSetLabelMap[resourceSet.type] : 'Choose...'}
          <DownOutlined />
        </Button>
      </Dropdown>

      <div>
        <Tooltip title="Reload resources" placement="bottom">
          <Button type="link" size="middle" icon={<ReloadOutlined />} onClick={handleRefresh} />
        </Tooltip>

        <Tooltip title="Clear resources" placement="bottom">
          <Button type="link" size="middle" icon={<ClearOutlined />} onClick={handleClear} />
        </Tooltip>
      </div>
    </S.DiffSetSelectorDiv>
  );
};
