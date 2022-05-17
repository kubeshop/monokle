import {useCallback} from 'react';

import {Select} from 'antd';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {ResourceSet, resourceSetSelected, selectResourceSet} from '@redux/reducers/compare';

type Props = {
  side: 'left' | 'right';
};

export const ResourceSetTypeSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectResourceSet(state.compare, side));

  const handleSelectType = useCallback(
    (type: ResourceSet['type']) => {
      dispatch(resourceSetSelected({side, value: {type}}));
    },
    [dispatch, side]
  );

  return (
    <Select onChange={handleSelectType} placeholder="Choose…" value={resourceSet?.type} style={{width: 180}}>
      <Select.Option value="local">Local</Select.Option>
      <Select.Option value="cluster">Cluster</Select.Option>
      <Select.Option value="helm">Helm Preview</Select.Option>
      <Select.Option value="kustomize">Kustomize Preview</Select.Option>
    </Select>
  );
};
