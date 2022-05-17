import {useCallback} from 'react';

import {Select} from 'antd';

import invariant from 'tiny-invariant';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {PartialResourceSet, resourceSetSelected, selectKustomizeResourceSet} from '@redux/reducers/compare';

type Props = {
  side: 'left' | 'right';
};

export const KustomizeSelect: React.FC<Props> = ({side}) => {
  const dispatch = useAppDispatch();
  const resourceSet = useAppSelector(state => selectKustomizeResourceSet(state, side));
  invariant(resourceSet, 'invalid_state');
  const {currentKustomization, allKustomizations} = resourceSet;

  const handleSelect = useCallback(
    (kustomizationId: string) => {
      const value: PartialResourceSet = {type: 'kustomize', kustomizationId};
      dispatch(resourceSetSelected({side, value}));
    },
    [dispatch, side]
  );
  return (
    <Select
      onChange={id => handleSelect(id as string)}
      placeholder="Choose Kustomization…"
      value={currentKustomization?.id}
      style={{width: '100%'}}
    >
      {allKustomizations.map(kustomization => {
        return (
          <Select.Option key={kustomization.id} value={kustomization.id}>
            {kustomization.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};
