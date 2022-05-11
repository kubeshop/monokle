import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Button, Dropdown, Menu, Tooltip} from 'antd';

import {ClearOutlined, DownOutlined, ReloadOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {resourceSetCleared, resourceSetRefreshed, resourceSetSelected} from '@redux/reducers/compare';

import {PartialStore} from './CompareModal';
import {ResourceSet} from './CompareState';

const DiffSetSelectorDiv = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-radius: 2;
  background-color: #31393c;
  margin-bottom: 16px;
`;

const resourceSetLabelMap: Record<ResourceSet['type'], string> = {
  local: 'Local',
  cluster: 'Cluster',
  helm: 'Helm Preview',
  kustomize: 'Kustomize',
};

export function ResourceSetSelector({side}: {side: 'left' | 'right'}) {
  const dispatch = useDispatch();
  const resourceSet = useSelector((state: PartialStore) => {
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
    <DiffSetSelectorDiv>
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
    </DiffSetSelectorDiv>
  );
}
