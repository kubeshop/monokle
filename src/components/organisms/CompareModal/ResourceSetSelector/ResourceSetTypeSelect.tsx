import {useCallback} from 'react';

import {Select} from 'antd';

import {ResourceSet, resourceSetSelected, selectResourceSet} from '@redux/compare';
import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {kubeConfigPathValidSelector} from '@redux/selectors';

import * as S from './ResourceSetTypeSelect.styled';

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetTypeSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));
  const isKubeConfigPathValid = useAppSelector(kubeConfigPathValidSelector);

  const handleSelectType = useCallback(
    (type: ResourceSet['type']) => {
      dispatch(resourceSetSelected({side, value: {type}}));
    },
    [dispatch, side]
  );

  return (
    <S.SelectColor>
      <Select
        onChange={handleSelectType}
        placeholder="Choose…"
        value={resourceSet?.type === 'helm-custom' ? 'helm' : resourceSet?.type}
        style={{width: 180}}
      >
        <Select.Option value="local">Local</Select.Option>
        <Select.Option value="cluster" disabled={!isKubeConfigPathValid}>
          Cluster
        </Select.Option>
        <Select.Option value="helm">Helm Preview</Select.Option>
        <Select.Option value="kustomize">Kustomize Preview</Select.Option>
      </Select>
    </S.SelectColor>
  );
};
